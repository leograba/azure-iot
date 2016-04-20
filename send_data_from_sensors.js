// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

'use strict';

// Required modules and functions
var Protocol = require('azure-iot-device-http').Http;// The transport protocol used
var Client = require('azure-iot-device').Client;
var Message = require('azure-iot-device').Message;
var Bancroft = require('./node_modules/bancroft/bancroft.js');
var bancroft = new Bancroft();
var fs = require('fs');

// Create client to connect to the IoT Hub using the device connection string and the HTTP protocol
var connectionString = "HostName=yourHostName.azure-devices.net;DeviceId=yourDevice;SharedAccessKey=yourSharedAccessKey";
var client = Client.fromConnectionString(connectionString, Protocol);
var sendInterval = {timerGet: 1000, timerSend: 1000};//loop handler

//Read some offset and scale constants from the MPU-6050 and convert to number
var temp_offset = +fs.readFileSync('/sys/bus/iio/devices/iio:device2/in_temp_offset');
var temp_scale = +fs.readFileSync('/sys/bus/iio/devices/iio:device2/in_temp_scale');
var accel_scale = +fs.readFileSync('/sys/bus/iio/devices/iio:device2/in_accel_scale');
var anglvel_scale = +fs.readFileSync('/sys/bus/iio/devices/iio:device2/in_anglvel_scale');
var gps_coordinates ;//variable to hold the gps coordinates
// Data to be sent
var timenow, temperature, Distance, Acceleration = {}, Gyroscope = {};

// gps events
bancroft.on('location', function (location) {//updates the gps coordinates variable
	location.geometries = "point";
	gps_coordinates = location;
	console.log('got new location', gps_coordinates);
});
bancroft.on('disconnect', function (err) {//if gps is disconnected
	bancroft = new Bancroft();//tries to reconnect once
	console.log('trying to reconnect gps...');
});

// Loops that call the functions to read sensors and send to the cloud
sendInterval.handlerGet = setInterval(getAllSensors, sendInterval.timerGet);
sendInterval.handlerSend = setInterval(sendToIotHub, sendInterval.timerSend);

//Function that reads data from sensor
function readSensor(path, callback) {
	fs.readFile(path, function (err, data) {
		if(err){//if data could not be read
			console.log("Error reading sensor: " + err);
			callback(err, null);//pass the error to the callback
			return;
		}
		callback(null, data);//callback without error
	});
}

//Function that reads all sensors data
function getAllSensors() {
	var d = new Date();
	timenow = d.getTime();// get board time (in Epoch time)
	readSensor('/sys/class/hcsr04/value', function(err,data){
		if(data != -1){//check if sensor reading was successful
			Distance = data*340/2000000;//Get distance reading
		}
	});
	readSensor('/sys/bus/iio/devices/iio:device2/in_temp_raw', function(err,data){
		temperature = (+data+temp_offset)*temp_scale;//Get temperature reading
	});
	readSensor('/sys/bus/iio/devices/iio:device2/in_accel_x_raw', function(err,data){
		Acceleration.accel_x = data*accel_scale;//Get x axis acceleration
	});
	readSensor('/sys/bus/iio/devices/iio:device2/in_accel_y_raw', function(err,data){
		Acceleration.accel_y = data*accel_scale;//Get y axis acceleration
	});
	readSensor('/sys/bus/iio/devices/iio:device2/in_accel_z_raw', function(err,data){
		Acceleration.accel_z = data*accel_scale;//Get z axis acceleration
	});
	readSensor('/sys/bus/iio/devices/iio:device2/in_anglvel_x_raw', function(err,data){
		Gyroscope.gyro_y = data*anglvel_scale;//Get x axis gyro
	});
	readSensor('/sys/bus/iio/devices/iio:device2/in_anglvel_y_raw', function(err,data){
		Gyroscope.gyro_z = data*anglvel_scale;//Get y axis gyro
	});
	readSensor('/sys/bus/iio/devices/iio:device2/in_anglvel_z_raw', function(err,data){
		Gyroscope.gyro_z = data*anglvel_scale;//Get z axis gyro
	});
}

function sendToIotHub() {
	// Add the data to a JSON encoded string
	var data = JSON.stringify({
		ObjectName: 'toradex2',
		ObjectType: 'SensorTagEvent',
		temp: temperature,
		acceleration: Acceleration,
		gyroscope: Gyroscope,
		gps: gps_coordinates,
		distance: Distance,
		boardTime: timenow
	});

	var message = new Message(data);// Encapsulate the message to be sent
	message.properties.add('myproperty', 'myvalue');
	console.log('sending message to the IoT Hub: ');// Feedback message to the console
	console.log(data);
	client.sendEvent(message, printResultFor('send'));// Send message to the IoT Hub
}

//Helper function to print results in the console
function printResultFor(op) {
  return function printResult(err, body, res) {
    if (err) console.log(op + ' error: ' + err.toString());
    if (res){
      console.log(op + ' response: ' + res);
      console.log(body);
    }
  };
}

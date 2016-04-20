#!/bin/sh
sleep 2
stty speed 9600 </dev/ttyLP2 # UART_B
gpsd -n /dev/ttyLP2
insmod /home/root/azure-iot-car/hcsr04.ko # ultrassonic module
modprobe inv-mpu6050 # Gyro/accelerometer module
while : ; do
        node /home/root/azure-iot-car/send_data_from_sensors.js
	sleep 2
done

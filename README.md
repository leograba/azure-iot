# azure-iot
Sending data from a Toradex customized SBC to the Azure IoT Hub

## Description

This repository contains the necessary files to reproduce the steps described in a [hackster.io](https://www.hackster.io) project
in which a [Toradex](toradex.com) [Colibri VF61 CoM](http://developer.toradex.com/products/colibri-vf61) + [Iris Carrier Board](http://developer.toradex.com/products/iris-carrier-board)
are used to integrate an ultrasonic distance sensor HC-SR04, an accelerometer, gyroscope and temperature sensor MPU-6050 and a GPS shield IKeyes V1.2.

The Toradex embedded system runs a Node.js application that sends telemetry data
from the interfaced sensors to the [Microsoft Azure IoT Hub](https://azure.microsoft.com/en-us/services/iot-hub/).

Toradex is an Azure IoT [Certified Partner](https://azure.microsoft.com/en-us/marketplace/certified-iot-partners/) from Microsoft. It is a company focused in providing systems on module (SoM)
and single-board computer (SBC) solutions in which operating systems such as Linux and Windows CE can be run. Toradex also has an [embedded system](https://www.toradex.com/windows-iot-starter-kit)
that runs the Windows 10 IoT Core.

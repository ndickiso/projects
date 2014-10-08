/*Monitor Arduino Web App
ATW 1405
Nathan Dickison
05/30/14

This is an small web application that runs off an Arduino Uno with an ethernet shield, PIR Sensor, Ultrasound Range Finder, and LDR sensor.
The Arduino uses the Ethernet ans SPI library to send requests to my server through a small api, every 5-10 seconds that updates a database with the a temp, motion,
object movement and motion value. These values are displayed to a web interface on the root of the ip address. 

You can send a response back to the arduino from the web interface that can turn on a light, play an alarm, or eventually make the box rotatate.

The application runs off of a Linux Ubuntu 12.4 server, bottle framework, using python, javascript, bootstrap, jquery, chart.js, sqlite3.
*/

//INCLUDES 
#include <SPI.h>
#include <Ethernet.h>
#include "pitches.h"

//SET VARIABLES
int ldrPin = 0;  //Pin for Photo resistor
int ledPin = 6;   //Pin to light led from interface
int speakerPin = 8;  //Pin the piezo is connected to
int trigPin = 3;  //Trig out pin for Range Sensor, connects to trigg
int echoPin = 2;  //Echo in pin for Range Sensor
int pirPin = 9;  //Pin for PIR sensor to read HIGH or LOW
int inches;   //inches for conversion from cm
int val = 0;  //Int for value returned from API response
boolean change = true;  //Change boolen of object moved 
float tempOffset = 10.0;  //Temperature offset from chip to local enviorment
int motionCounter = 0;   //Motion counter that will be reset every API request
int moveCounter = 0;  //Object move counter that will be reset every API request
int currentTemp;   //Current temp that getTemp function overides 
int currentLight;  //Current light reading that getlight function overides 
int maxLength = 8;   //Max length of object away in inches for object move function
String data;  //The datastring that will be sent to the API
int postingInterval = 5000;  //API/client request interval
int lastConnectionTime = 0;   //Set Last connection time to 0 for timer

// notes in the melody:
int melody[] = {
  NOTE_C4, NOTE_G3,NOTE_C4, NOTE_G3, NOTE_C4, NOTE_G3, NOTE_C4, NOTE_G3};

// note durations: 4 = quarter note, 8 = eighth note, etc.:
int noteDurations[] = {
  2,2,2,2,2,2,2,2 };

// we start, assuming no motion detected
int pirState = LOW; 

//Set Unique mca address
byte mac[] = { 0xDE, 0xAD, 0xBE, 0xEF, 0xDD, 0xDD };

// My Server IP
IPAddress request(107,170,78,197);

//unique local IP address
IPAddress ip(10,0,0,20);

// initialize the library instance:
EthernetClient client;


//SETUP
void setup() {
 // Open serial communications and wait for port to open:
  Serial.begin(9600);
  
   //Setup Pins for tracking
  pinMode(trigPin,OUTPUT);
  pinMode(echoPin,INPUT);
  pinMode(pirPin, INPUT);
  pinMode(ledPin, OUTPUT); 
    
  // start the Ethernet connection and the server:
  Ethernet.begin(mac);
  delay(1000);
  Serial.print("server is at ");
  Serial.println(Ethernet.localIP());
}

// FUNCTION TO PLAY MUSIC ON API RESPONSE
void playMusic(){
  // iterate over the notes of the melody:
  for (int thisNote = 0; thisNote < 8; thisNote++) {

    // to calculate the note duration, take one second 
    // divided by the note type.
    //e.g. quarter note = 1000 / 4, eighth note = 1000/8, etc.
    int noteDuration = 1000/noteDurations[thisNote];
    tone(8, melody[thisNote],noteDuration);

    // to distinguish the notes, set a minimum time between them.
    // the note's duration + 30% seems to work well:
    int pauseBetweenNotes = noteDuration * 1.30;
    delay(pauseBetweenNotes);
    // stop the tone playing:
    noTone(8);
  }
}

//FUNCTION TO CHECK OBJECT MOVEMENT FROM RANGE FINDER
void objectCheck(){
  
  int duration, distance;

  digitalWrite(trigPin,HIGH);
  delayMicroseconds(2000); 
  digitalWrite(trigPin,LOW);
  
  duration = pulseIn(echoPin,HIGH);
  distance = (duration/2) /29.1;
  inches = (distance * 0.393701);
  
  if (inches >= maxLength && change == true){
     
     moveCounter = moveCounter + 1;   
     Serial.println("Object Was Moved!");
     change = false;
     
  }else if(inches >= 0 && inches <= maxLength){
    //Serial.println("Locked in.");
    change = true;
  }
  
  //TEST INCHES HERE
  //Serial.println("");
  //Serial.print(inches);
  //Serial.println("in");
}

//FUNCTION TO CHECK MOTION FROM PIR SENSOR
void motionCheck(){
  val = digitalRead(pirPin); // read input value
    if (val == HIGH) { // check if the input is HIGH
    
        if (pirState == LOW) {
          motionCounter = motionCounter + 1;
          
          Serial.println("Motion detected!");
        // We only want to print on the output change, not state
          pirState = HIGH;
        }
    } else {
      
        if (pirState == HIGH){
        pirState = LOW;
        }
    }
}

//FUNCTION FOR GETTING TEMP OFF CHIP SENSOR
void getTemp(){
  unsigned int wADC;
  int t;
  int f;

  // The internal temperature has to be used
  // with the internal reference of 1.1V.
  // Channel 8 can not be selected with
  // the analogRead function yet.

  // Set the internal reference and mux.
  ADMUX = (_BV(REFS1) | _BV(REFS0) | _BV(MUX3));
  ADCSRA |= _BV(ADEN);  // enable the ADC

  delay(20);            // wait for voltages to become stable.

  ADCSRA |= _BV(ADSC);  // Start the ADC

  // Detect end-of-conversion
  while (bit_is_set(ADCSRA,ADSC));

  // Reading register "ADCW" takes care of how to read ADCL and ADCH.
  wADC = ADCW;

  // The offset of 324.31 could be wrong. It is just an indication.
  t = (wADC - 324.31 ) / 1.22;

  // The returned temperature is in degrees Celcius. (ADD OFFSET HERE)
  //return (t);
  //datastreams[1].setFloat(t);
  
  //Return Fahrenheit
  f = (t*1.8 + 32) + tempOffset;
  //datastreams[1].setFloat(f);
  //return f;
  currentTemp = f;
}

//FUNCTION FOR ARDUINO ACTIONS BASED OFF OF API RESPONSE
void changeIt(int i){
  
  switch(i){
    
    //conditional for failed post on API
    case 0:
      Serial.println("Failed API Post");
      break;
  
    //conditional for successful post on API
    case 1:
      Serial.println("Successful API Post");
      break;
  
   //conditional for playing sound
    case 2:
      Serial.println("Play Sound");
      playMusic();
      break;
  
    //conditional to turn on light
    case 3:
      Serial.println("Turn on Light");
      digitalWrite(ledPin,HIGH);
      delay(2000);
      digitalWrite(ledPin,LOW);
      break;
  
    //conditional to move the monitor
    case 4:
      Serial.println("Move the monitor");
      break;
  }
}

//FUNCTION TO GET CURRENT LIGHT READING
void getLight(){
  currentLight = analogRead(ldrPin)/3;
}

//SET DATA STRING FOR API REQUEST
 void setData(){
  getTemp();
  getLight();
  
  data="";
  data+=motionCounter;
  data+="/";
  data+=moveCounter;
  data+="/";
  data+=currentTemp;
  data+="/";
  data+=currentLight;
  
  //TEST READINGS HERE
  /*
  Serial.print("Motion: ");
  Serial.println(motionCounter);
  Serial.print("Object Moved: ");
  Serial.println(moveCounter);
  Serial.print("Temp: ");
  Serial.println(currentTemp);
  Serial.print("Light: ");
  Serial.println(analogRead(ldrPin)/3);
  */
  
  //Reset Activity counters to 0
  motionCounter = 0;
  moveCounter = 0;

 }

//MAIN LOOP 
void loop(){
  
  // if you're not connected, and ten seconds have passed since
  // your last connection, then connect again and send data:
  if((millis() - lastConnectionTime > postingInterval)) {
    
    Serial.println("Timer Started");  
    
    //Check motion, object move functions multiple times between request
    int milliTime = 250;
    int count = postingInterval/milliTime;
    int i = 1;
    
    while(i < count){
      count = count - i;
      motionCheck();
      objectCheck();
      delay(milliTime);
    }
    
    //Set data string
    setData();
    
    //Send HTTP request to IP
    httpRequest();
    
    //Slight delay for Client
    delay(1000);
  }

   while(client.available()) {
    //char c = client.read();
    //Serial.print(c);

      while(client.findUntil("$", "\n\r")){
        int val = client.parseInt();
        //Serial.print(val);
        changeIt(val); 
      }
   }
  
    // give the web browser time to receive the data
    delay(10);
    // close the connection:
    client.stop();
    //Serial.println(" client disconnected");
}

//FUNCTION TO SEND REQUEST TO IP
void httpRequest() {
if (client.connect(request, 80)) {
  Serial.println("connected..");
  client.print("GET /apiLog/");
  client.print(data);
  client.println(" HTTP/1.1");
  client.println("Host: 107.170.78.197");
  client.println("Content-Type: text/html; charset=UTF-8");
  client.println("Connection: close");
  client.println();

  lastConnectionTime = millis();

  Serial.print("GET /apiLog/");
  Serial.print(data);
  Serial.println(" HTTP/1.1");
  } 
  
  //If no connection can be made
  else {
    Serial.println();
    Serial.println("disconnecting.");
    client.stop();
  }

}

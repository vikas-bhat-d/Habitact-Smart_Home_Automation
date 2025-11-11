#include <WiFi.h>
#include <WebServer.h>
#include <ArduinoJson.h>
#include <stdint.h>
#include "DHT.h"
#define DHTPIN 13 
#define DHTTYPE DHT11

const char* ssid = "";
const char* password = "";

const int n=4;
const int controlPins[n]={32,33,18,19};


DHT dht(DHTPIN,DHTTYPE);

WebServer server(80);


void addCORSHeaders() {
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.sendHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  server.sendHeader("Access-Control-Allow-Headers", "Content-Type");
}

void handlePreflight() {
  addCORSHeaders();
  server.send(204);  // No Content
}

uint8_t converStrtoUint8_t(const char* str){
  int num = atoi(str);
  uint8_t gpio = (uint8_t) num;
  return gpio;
}


void handleGetRequest() {
  addCORSHeaders();
  StaticJsonDocument<200> jsonResponse;
  JsonObject status=jsonResponse.createNestedObject("status");
  status["humidity"]=dht.readHumidity();
  status["temperature"]=dht.readTemperature();
  jsonResponse["message"] = "Hello, this is a habitect!";
  jsonResponse["uptime"] = millis();
  JsonObject controls=jsonResponse.createNestedObject("controls");
  for(int i=0;i<n;i++){
    Serial.println(controlPins[i]);
    controls[String(controlPins[i])]=digitalRead(controlPins[i]);
  }

  String response;
  serializeJson(jsonResponse, response);

  server.send(200, "application/json", response);
}


void handlePostRequest() {
  addCORSHeaders();
  if (server.hasArg("plain")) {
    String body = server.arg("plain");
    StaticJsonDocument<200> jsonRequest;

    DeserializationError error = deserializeJson(jsonRequest, body);

    if (error) {
      server.send(400, "application/json", "{\"error\":\"Invalid JSON\"}");
      return;
    }


    String name = jsonRequest["name"];
    int age = jsonRequest["age"];


    StaticJsonDocument<200> jsonResponse;
    jsonResponse["status"] = "success";
    jsonResponse["received"]["name"] = name;
    jsonResponse["received"]["age"] = age;

    String response;
    serializeJson(jsonResponse, response);

    server.send(200, "application/json", response);
  } else {
    server.send(400, "application/json", "{\"error\":\"No JSON body found\"}");
  }
}

void handleTestRequest() {
  Serial.println("Recieved test request");
  addCORSHeaders();
  if (server.hasArg("plain")) {
    String body = server.arg("plain");
    StaticJsonDocument<200> jsonRequest;

    DeserializationError error = deserializeJson(jsonRequest, body);

    if (error) {
      server.send(400, "application/json", "{\"error\":\"Invalid JSON\"}");
    }

    String state = jsonRequest["state"];
    Serial.println(state);
    if (state == "true"){
      Serial.println("state==true");
      digitalWrite(LED_BUILTIN, HIGH);
    }
    else if(state == "false"){
      Serial.println("state==false");
      digitalWrite(LED_BUILTIN, LOW);
    }

    StaticJsonDocument<200> jsonResponse;
    jsonResponse["status"] = "success";
    jsonResponse["message"] = "Updated the LED succesfully";
    jsonResponse["uptime"] = millis();

    String response;
    serializeJson(jsonResponse, response);

    server.send(200, "application/json", response);
  }
}

void handleControlRequest(){
  addCORSHeaders();
  if(server.hasArg("plain")){
    String body=server.arg("plain");
    StaticJsonDocument<200> jsonRequest;

    DeserializationError error=deserializeJson(jsonRequest,body);
    if(error)
      server.send(400, "application/json", "{\"error\":\"Invalid JSON\"}");

    const char* strGPIO=jsonRequest["gpio"];
    uint8_t gpio=converStrtoUint8_t(strGPIO);
    String state = jsonRequest["state"];
    Serial.println(gpio);
    Serial.println(state);

    // digitalWrite(gpio,state);
    if (state == "true"){
      Serial.println("state==true");
      digitalWrite(gpio, HIGH);
    }
    else if(state == "false"){
      Serial.println("state==false");
      digitalWrite(gpio, LOW);
    }

    StaticJsonDocument<200> jsonResponse;
    jsonResponse["status"] = "success";
    jsonResponse["message"] = "changes the state of gpio succesfully";
    jsonResponse["uptime"] = millis();

    String response;
    serializeJson(jsonResponse, response);

    server.send(200, "application/json", response);

  }
}

void setup() {
  Serial.begin(115200);
  dht.begin();

  pinMode(LED_BUILTIN, OUTPUT);
  for(int i=0;i<n;i++)
    pinMode(controlPins[i],OUTPUT);
  
  Serial.println("Connecting to WiFi...");
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.print(".");
  }
  Serial.println("\nConnected to WiFi");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());


  server.on("/", HTTP_GET, handleGetRequest);
  server.on("/post", HTTP_POST, handlePostRequest);
  server.on("/test", HTTP_POST, handleTestRequest);
  server.on("/test", HTTP_OPTIONS, handlePreflight);
  server.on("/control",HTTP_POST,handleControlRequest);
  server.on("/control", HTTP_OPTIONS, handlePreflight);



  server.begin();
  Serial.println("HTTP server started");
}

void loop() {
  server.handleClient();
}

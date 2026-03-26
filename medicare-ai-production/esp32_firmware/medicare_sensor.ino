/*
 * MediCare AI+ — ESP32 + MAX30102 Firmware
 * Blynk Template: TMPL318m72Xx_ (neal) | Region: BLR1
 * Sends HR + SpO2 to MediCare AI+ webhook every 5 seconds
 */

// ─── CONFIGURATION ───────────────────────────────────────────────────
#define BLYNK_TEMPLATE_ID   "TMPL318m72Xx_"
#define BLYNK_TEMPLATE_NAME "neal"
#define BLYNK_AUTH_TOKEN    "y0N3VYkfDWjK3shOZeaWrm6x9BWuquVVV"

// TODO: Fill these in
const char* WIFI_SSID     = "YOUR_WIFI_NAME";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";
const char* PATIENT_ID    = "YOUR_CONVEX_PATIENT_ID"; // from Convex dashboard
const char* WEBHOOK_URL   = "https://YOUR_VERCEL_URL/api/webhooks/blynk";
const int   PATIENT_AGE   = 28;

// ─── LIBRARIES ───────────────────────────────────────────────────────
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <Wire.h>
#include "MAX30105.h"
#include "heartRate.h"
#include <BlynkSimpleEsp32.h>

// ─── GLOBALS ─────────────────────────────────────────────────────────
MAX30105 particleSensor;

// Moving average buffers (4 samples)
const byte RATE_SIZE = 4;
byte   rates[RATE_SIZE];
byte   rateSpot = 0;
long   lastBeat = 0;
float  beatsPerMinute;
int    beatAvg;

// SpO2 calculation
long   irValue, redValue;
float  spo2 = 98.0;

unsigned long lastSendTime = 0;
const unsigned long SEND_INTERVAL = 5000; // 5 seconds

// ─── SETUP ───────────────────────────────────────────────────────────
void setup() {
  Serial.begin(115200);
  Serial.println("MediCare AI+ Sensor Starting...");

  // Init MAX30102
  Wire.begin(21, 22); // SDA=GPIO21, SCL=GPIO22
  if (!particleSensor.begin(Wire, I2C_SPEED_FAST)) {
    Serial.println("ERROR: MAX30102 not found. Check wiring.");
    while (1);
  }
  particleSensor.setup();
  particleSensor.setPulseAmplitudeRed(0x0A);
  particleSensor.setPulseAmplitudeGreen(0);
  Serial.println("MAX30102 initialized.");

  // Connect WiFi
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected: " + WiFi.localIP().toString());

  // Connect Blynk
  Blynk.begin(BLYNK_AUTH_TOKEN, WIFI_SSID, WIFI_PASSWORD, "blynk.cloud", 80);
  Serial.println("Blynk connected.");
}

// ─── LOOP ────────────────────────────────────────────────────────────
void loop() {
  Blynk.run();

  irValue  = particleSensor.getIR();
  redValue = particleSensor.getRed();

  // Detect heartbeat
  if (checkForBeat(irValue)) {
    long delta = millis() - lastBeat;
    lastBeat = millis();
    beatsPerMinute = 60 / (delta / 1000.0);

    if (beatsPerMinute < 255 && beatsPerMinute > 20) {
      rates[rateSpot++] = (byte)beatsPerMinute;
      rateSpot %= RATE_SIZE;
      beatAvg = 0;
      for (byte x = 0; x < RATE_SIZE; x++) beatAvg += rates[x];
      beatAvg /= RATE_SIZE;
    }
  }

  // Simple SpO2 estimate from red/IR ratio
  if (irValue > 50000 && redValue > 50000) {
    float ratio = (float)redValue / (float)irValue;
    spo2 = 110.0 - 25.0 * ratio;
    spo2 = constrain(spo2, 85.0, 100.0);
  }

  // Send every 5 seconds
  if (millis() - lastSendTime >= SEND_INTERVAL) {
    lastSendTime = millis();

    int hr   = (beatAvg > 0) ? beatAvg : (int)beatsPerMinute;
    int sp   = (int)spo2;

    // Clamp to realistic ranges
    hr = constrain(hr, 40, 200);
    sp = constrain(sp, 70, 100);

    Serial.printf("HR: %d BPM | SpO2: %d%% | IR: %ld\n", hr, sp, irValue);

    // Update Blynk virtual pins
    Blynk.virtualWrite(V0, hr);
    Blynk.virtualWrite(V1, sp);

    // Send to MediCare AI+ webhook
    if (WiFi.status() == WL_CONNECTED) {
      sendToWebhook(hr, sp);
    } else {
      Serial.println("WiFi disconnected, reconnecting...");
      WiFi.reconnect();
    }
  }
}

// ─── WEBHOOK ─────────────────────────────────────────────────────────
void sendToWebhook(int heartRate, int spo2Val) {
  HTTPClient http;
  http.begin(WEBHOOK_URL);
  http.addHeader("Content-Type", "application/json");

  StaticJsonDocument<200> doc;
  doc["patientId"]  = PATIENT_ID;
  doc["heartRate"]  = heartRate;
  doc["spo2"]       = spo2Val;
  doc["age"]        = PATIENT_AGE;

  String body;
  serializeJson(doc, body);

  int code = http.POST(body);
  if (code == 200) {
    Serial.println("✓ Sent to MediCare AI+");
  } else {
    Serial.printf("✗ Webhook failed: HTTP %d\n", code);
  }
  http.end();
}

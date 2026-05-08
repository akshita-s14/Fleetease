import 'package:flutter/material.dart';
import 'gps_service.dart';
import 'dart:async';

void main() => runApp(MyApp());

class MyApp extends StatelessWidget {
  @override Widget build(BuildContext context) {
    return MaterialApp(home: DriverHome());
  }
}

class DriverHome extends StatefulWidget { @override _DriverHomeState createState() => _DriverHomeState(); }

class _DriverHomeState extends State<DriverHome> {
  final GpsService gps = GpsService();
  Timer? timer;
  int vehicleId = 1;

  @override void initState() {
    super.initState();
    timer = Timer.periodic(Duration(seconds: 10), (_) => gps.sendLocation(vehicleId));
  }

  @override void dispose() { timer?.cancel(); super.dispose(); }

  @override Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Fleetease Driver')),
      body: Center(child: Text('Driver app running. Sending GPS every 10s.')),
    );
  }
}

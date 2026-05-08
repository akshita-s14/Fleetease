import 'package:location/location.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class GpsService {
  final Location location = Location();

  Future<void> sendLocation(int vehicleId) async {
    try {
      LocationData current = await location.getLocation();
      final res = await http.post(Uri.parse('http://YOUR_SERVER_IP:5000/api/gps/update'),
        headers: {'Content-Type':'application/json'},
        body: jsonEncode({
          'vehicle_id': vehicleId,
          'latitude': current.latitude,
          'longitude': current.longitude,
          'speed_kmph': 0,
          'fuel_level': null
        })
      );
      print('GPS sent: ${res.statusCode}');
    } catch (e) { print('Error sending GPS: $e'); }
  }
}

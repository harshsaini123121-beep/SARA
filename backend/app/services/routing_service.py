import math
import requests

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371.0 # Earth radius in kilometers
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 2)

def generate_interpolated_route(start: tuple, end: tuple, num_points: int = 25) -> list:
    """Generates realistic street-like polyline points between start and end coordinates."""
    lat1, lon1 = start
    lat2, lon2 = end
    
    # Introduce mid-point offsets to mimic road bends
    mid_lat = (lat1 + lat2) / 2.0 + (lat2 - lat1) * 0.1
    mid_lon = (lon1 + lon2) / 2.0 - (lon2 - lon1) * 0.15
    
    route = []
    # First half: start -> mid
    for i in range(num_points // 2):
        t = i / (num_points // 2)
        lat = lat1 + t * (mid_lat - lat1) + 0.0005 * math.sin(t * math.pi)
        lon = lon1 + t * (mid_lon - lon1) + 0.0005 * math.cos(t * math.pi)
        route.append([round(lat, 6), round(lon, 6)])
        
    # Second half: mid -> end
    for i in range(num_points // 2 + 1):
        t = i / (num_points // 2)
        lat = mid_lat + t * (lat2 - mid_lat) - 0.0005 * math.sin(t * math.pi)
        lon = mid_lon + t * (lon2 - mid_lon) - 0.0005 * math.cos(t * math.pi)
        route.append([round(lat, 6), round(lon, 6)])
        
    return route

def calculate_route(start_lat: float, start_lon: float, end_lat: float, end_lon: float) -> dict:
    distance = haversine_distance(start_lat, start_lon, end_lat, end_lon)
    
    # Attempt OSRM call
    try:
        url = f"http://router.project-osrm.org/route/v1/driving/{start_lon},{start_lat};{end_lon},{end_lat}?overview=full&geometries=geojson"
        resp = requests.get(url, timeout=2.5)
        if resp.status_code == 200:
            data = resp.json()
            if 'routes' in data and len(data['routes']) > 0:
                coords = data['routes'][0]['geometry']['coordinates']
                # OSRM returns [lon, lat], convert to [lat, lon] for Leaflet
                leaflet_coords = [[pt[1], pt[0]] for pt in coords]
                dist_km = round(data['routes'][0]['distance'] / 1000.0, 2)
                return {
                    "distance_km": dist_km,
                    "geometry": leaflet_coords,
                    "mode": "OSRM_LIVE"
                }
    except Exception:
        pass
        
    # Fallback simulation routing
    geometry = generate_interpolated_route((start_lat, start_lon), (end_lat, end_lon))
    return {
        "distance_km": distance,
        "geometry": geometry,
        "mode": "DEMO ROUTING MODE"
    }

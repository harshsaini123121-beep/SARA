import os
import numpy as np
import pandas as pd

def generate_dataset(num_samples=12000, seed=42):
    np.random.seed(seed)
    
    # 1. Feature distributions
    distance_km = np.random.uniform(0.5, 30.0, num_samples)
    traffic_levels = np.random.choice(['LOW', 'MEDIUM', 'HIGH', 'SEVERE'], size=num_samples, p=[0.3, 0.35, 0.25, 0.1])
    hours = np.random.randint(0, 24, size=num_samples)
    days = np.random.randint(0, 7, size=num_samples)
    weather = np.random.choice(['CLEAR', 'RAIN', 'FOG'], size=num_samples, p=[0.75, 0.2, 0.05])
    road_types = np.random.choice(['URBAN', 'HIGHWAY', 'NARROW'], size=num_samples, p=[0.6, 0.3, 0.1])
    
    # 2. Physics & Realistic Multipliers
    # Base speeds in km/h
    speed_map = {'HIGHWAY': 55.0, 'URBAN': 32.0, 'NARROW': 22.0}
    traffic_mult_map = {'LOW': 1.0, 'MEDIUM': 1.3, 'HIGH': 1.75, 'SEVERE': 2.4}
    weather_mult_map = {'CLEAR': 1.0, 'RAIN': 1.25, 'FOG': 1.45}
    
    travel_times = []
    
    for i in range(num_samples):
        dist = distance_km[i]
        t_level = traffic_levels[i]
        hr = hours[i]
        w_cond = weather[i]
        r_type = road_types[i]
        
        base_speed = speed_map[r_type]
        t_mult = traffic_mult_map[t_level]
        w_mult = weather_mult_map[w_cond]
        
        # Rush hour penalty (8-10 and 17-20 on weekdays)
        is_weekday = days[i] < 5
        is_rush_hour = is_weekday and ((8 <= hr <= 10) or (17 <= hr <= 20))
        rush_mult = 1.25 if is_rush_hour else 1.0
        
        # Calculate base travel time in minutes
        base_time = (dist / base_speed) * 60.0
        actual_time = base_time * t_mult * w_mult * rush_mult
        
        # Add random Gaussian noise (5% standard deviation)
        noise = np.random.normal(0, 0.05 * actual_time)
        final_time = max(1.0, round(actual_time + noise, 2))
        
        travel_times.append(final_time)
        
    df = pd.DataFrame({
        'distance_km': np.round(distance_km, 2),
        'traffic_level': traffic_levels,
        'hour_of_day': hours,
        'day_of_week': days,
        'weather_condition': weather,
        'road_type': road_types,
        'travel_time_minutes': travel_times
    })
    
    os.makedirs('data', exist_ok=True)
    df.to_csv('data/emergency_trips.csv', index=False)
    print(f"Generated dataset with {len(df)} records at data/emergency_trips.csv")
    return df

if __name__ == '__main__':
    generate_dataset()

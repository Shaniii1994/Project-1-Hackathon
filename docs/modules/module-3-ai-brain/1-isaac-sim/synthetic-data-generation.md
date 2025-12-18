# Synthetic Data Generation with Isaac Sim

This section covers the generation of synthetic data using Isaac Sim for AI training, including techniques for creating diverse, labeled datasets and best practices for maximizing training effectiveness.

## Understanding Synthetic Data in Robotics AI

### The Role of Synthetic Data

Synthetic data generation is crucial for robotics AI because:
- Real-world data collection is expensive and time-consuming
- Dangerous or rare scenarios can be safely simulated
- Ground truth annotations are automatically available
- Data diversity can be controlled through domain randomization
- Privacy-sensitive data can be avoided

### Advantages of Synthetic Data

1. **Cost-Effective**: No need for expensive hardware or real-world data collection
2. **Safe Testing**: Dangerous scenarios can be simulated without risk
3. **Ground Truth**: Perfect annotations are automatically available
4. **Diversity Control**: Environmental conditions can be systematically varied
5. **Volume**: Large datasets can be generated quickly

## Isaac Sim Synthetic Data Pipeline

### Basic Data Generation Framework

```python
# Example: Basic synthetic data generation framework
import omni
import carb
import numpy as np
from PIL import Image
import json
import os

class IsaacSimSyntheticDataGenerator:
    def __init__(self, output_dir="synthetic_data"):
        self.output_dir = output_dir
        self.dataset_index = 0

        # Create output directory structure
        os.makedirs(os.path.join(output_dir, "images"), exist_ok=True)
        os.makedirs(os.path.join(output_dir, "labels"), exist_ok=True)
        os.makedirs(os.path.join(output_dir, "metadata"), exist_ok=True)

    def capture_synthetic_frame(self, camera_path, lidar_path=None):
        """
        Capture synthetic data frame with synchronized sensors
        """
        # Capture RGB image
        rgb_data = self.capture_rgb_image(camera_path)

        # Capture depth data
        depth_data = self.capture_depth_map(camera_path)

        # Capture segmentation mask
        seg_data = self.capture_segmentation_mask(camera_path)

        # Capture LiDAR data if available
        lidar_points = None
        if lidar_path:
            lidar_points = self.capture_lidar_points(lidar_path)

        # Create frame data dictionary
        frame_data = {
            "rgb": rgb_data,
            "depth": depth_data,
            "segmentation": seg_data,
            "lidar": lidar_points,
            "timestamp": carb.tokens.get_time(),
            "frame_id": self.dataset_index
        }

        return frame_data

    def capture_rgb_image(self, camera_path):
        """
        Capture RGB image from Isaac Sim camera
        """
        # Get camera sensor data
        camera_interface = omni.replicator.core.sim_npu.SensorInterface()
        rgb_data = camera_interface.get_data(camera_path + "/RenderProduct", "rgb")

        return rgb_data

    def capture_depth_map(self, camera_path):
        """
        Capture depth map from Isaac Sim camera
        """
        camera_interface = omni.replicator.core.sim_npu.SensorInterface()
        depth_data = camera_interface.get_data(camera_path + "/RenderProduct", "depth")

        return depth_data

    def capture_segmentation_mask(self, camera_path):
        """
        Capture segmentation mask from Isaac Sim
        """
        camera_interface = omni.replicator.core.sim_npu.SensorInterface()
        seg_data = camera_interface.get_data(camera_path + "/RenderProduct", "semantic_segmentation")

        return seg_data

    def capture_lidar_points(self, lidar_path):
        """
        Capture LiDAR point cloud data
        """
        # Get LiDAR interface
        lidar_interface = omni.replicator.core.sim_npu.SensorInterface()
        lidar_data = lidar_interface.get_data(lidar_path, "rotating_lidar_sensor")

        return lidar_data

    def save_frame_data(self, frame_data):
        """
        Save frame data to disk with proper labeling
        """
        # Save RGB image
        rgb_img = Image.fromarray(frame_data["rgb"])
        rgb_path = os.path.join(self.output_dir, "images", f"rgb_{frame_data['frame_id']:06d}.png")
        rgb_img.save(rgb_path)

        # Save depth map
        depth_img = Image.fromarray(frame_data["depth"])
        depth_path = os.path.join(self.output_dir, "images", f"depth_{frame_data['frame_id']:06d}.png")
        depth_img.save(depth_path)

        # Save segmentation mask
        seg_img = Image.fromarray(frame_data["segmentation"])
        seg_path = os.path.join(self.output_dir, "labels", f"seg_{frame_data['frame_id']:06d}.png")
        seg_img.save(seg_path)

        # Save metadata
        metadata = {
            "frame_id": frame_data["frame_id"],
            "timestamp": frame_data["timestamp"],
            "camera_intrinsics": self.get_camera_intrinsics(),
            "objects_in_scene": self.get_scene_objects(),
            "environment_conditions": self.get_environment_conditions()
        }

        meta_path = os.path.join(self.output_dir, "metadata", f"meta_{frame_data['frame_id']:06d}.json")
        with open(meta_path, 'w') as f:
            json.dump(metadata, f, indent=2)

        self.dataset_index += 1
        carb.log_info(f"Saved frame {frame_data['frame_id']} to {self.output_dir}")

    def get_camera_intrinsics(self):
        """
        Get camera intrinsic parameters
        """
        # Example intrinsic parameters
        intrinsics = {
            "fx": 525.0,  # Focal length in x
            "fy": 525.0,  # Focal length in y
            "cx": 319.5,  # Principal point x
            "cy": 239.5,  # Principal point y
            "width": 640,  # Image width
            "height": 480  # Image height
        }
        return intrinsics

    def get_scene_objects(self):
        """
        Get list of objects in the current scene with their properties
        """
        # This would be implemented based on the current scene
        objects = [
            {
                "name": "Robot",
                "bbox": [100, 100, 200, 200],
                "class": "robot",
                "visibility": 0.9
            },
            {
                "name": "Table",
                "bbox": [300, 200, 500, 400],
                "class": "furniture",
                "visibility": 1.0
            }
        ]
        return objects

    def get_environment_conditions(self):
        """
        Get current environment conditions
        """
        conditions = {
            "lighting": "indoor_warm",
            "weather": "clear",
            "time_of_day": "noon",
            "fog_density": 0.0,
            "background_complexity": "medium"
        }
        return conditions

# Usage example
generator = IsaacSimSyntheticDataGenerator(output_dir="robotics_synthetic_dataset")
```

## Domain Randomization Techniques

### Lighting Randomization

```python
# Example: Implementing lighting domain randomization
import random

class LightingRandomizer:
    def __init__(self):
        self.light_types = ["DomeLight", "SphereLight", "DistantLight"]
        self.temperature_range = (3000, 8000)  # Kelvin
        self.intensity_range = (500, 5000)    # Lumens

    def randomize_lighting(self, scene_bounds):
        """
        Randomize lighting conditions in the scene
        """
        # Randomize dome light (environment lighting)
        dome_light_intensity = random.uniform(0.5, 2.0)
        dome_light_temperature = random.uniform(*self.temperature_range)

        # Apply dome light randomization
        omni.kit.commands.execute(
            "ChangePropertyCommand",
            prop_path="/World/DomeLight.inputs:intensity",
            value=dome_light_intensity
        )
        omni.kit.commands.execute(
            "ChangePropertyCommand",
            prop_path="/World/DomeLight.inputs:color",
            value=self.kelvin_to_rgb(dome_light_temperature)
        )

        # Add random point lights
        num_point_lights = random.randint(1, 3)
        for i in range(num_point_lights):
            self.add_random_point_light(scene_bounds, i)

    def kelvin_to_rgb(self, kelvin):
        """
        Convert Kelvin temperature to RGB color
        """
        temp = kelvin / 100
        if temp <= 66:
            red = 255
            green = temp
            green = 99.4708025861 * math.log(green) - 161.1195681661
        else:
            red = temp - 60
            red = 329.698727446 * (red ** -0.1332047592)
            green = temp - 60
            green = 288.1221695283 * (green ** -0.0755148492)

        blue = temp - 10
        if temp >= 66:
            blue = 138.5177312231 * math.log(blue) - 305.0447927307
        else:
            blue = 0

        return tuple(max(0, min(255, c)) / 255.0 for c in [red, green, blue])

    def add_random_point_light(self, scene_bounds, index):
        """
        Add a random point light to the scene
        """
        light_path = f"/World/PointLight_{index}"

        # Create light
        omni.kit.commands.execute(
            "CreatePrimWithDefaultXform",
            prim_type="SphereLight",
            prim_path=light_path
        )

        # Random position within scene bounds
        x = random.uniform(scene_bounds[0], scene_bounds[1])
        y = random.uniform(scene_bounds[2], scene_bounds[3])
        z = random.uniform(scene_bounds[4], scene_bounds[5])

        omni.kit.commands.execute(
            "TransformPrimCommand",
            path=light_path,
            translation=(x, y, z)
        )

        # Random properties
        intensity = random.uniform(*self.intensity_range)
        color = self.kelvin_to_rgb(random.uniform(*self.temperature_range))

        omni.kit.commands.execute(
            "ChangePropertyCommand",
            prop_path=f"{light_path}.inputs:intensity",
            value=intensity
        )
        omni.kit.commands.execute(
            "ChangePropertyCommand",
            prop_path=f"{light_path}.inputs:color",
            value=color
        )

# Usage example
randomizer = LightingRandomizer()
scene_bounds = [-10, 10, -10, 10, 0, 5]  # xmin, xmax, ymin, ymax, zmin, zmax
randomizer.randomize_lighting(scene_bounds)
```

### Material Randomization

```python
# Example: Implementing material domain randomization
class MaterialRandomizer:
    def __init__(self):
        self.material_properties = {
            "roughness": (0.0, 1.0),
            "metallic": (0.0, 1.0),
            "specular": (0.0, 1.0),
            "albedo": [(0.1, 0.1, 0.1), (1.0, 1.0, 1.0)]  # min and max RGB values
        }

    def randomize_materials(self, material_paths):
        """
        Randomize materials in the scene
        """
        for mat_path in material_paths:
            # Randomize roughness
            roughness = random.uniform(*self.material_properties["roughness"])
            omni.kit.commands.execute(
                "ChangePropertyCommand",
                prop_path=f"{mat_path}.inputs:roughness",
                value=roughness
            )

            # Randomize metallic
            metallic = random.uniform(*self.material_properties["metallic"])
            omni.kit.commands.execute(
                "ChangePropertyCommand",
                prop_path=f"{mat_path}.inputs:metallic",
                value=metallic
            )

            # Randomize albedo (base color)
            min_albedo, max_albedo = self.material_properties["albedo"]
            albedo = tuple(
                random.uniform(min_val, max_val)
                for min_val, max_val in zip(min_albedo, max_albedo)
            )
            omni.kit.commands.execute(
                "ChangePropertyCommand",
                prop_path=f"{mat_path}.inputs:base_color",
                value=albedo
            )

    def apply_textures(self, object_paths, texture_library):
        """
        Apply random textures to objects
        """
        for obj_path in object_paths:
            # Randomly select texture from library
            texture_path = random.choice(texture_library)

            # Apply texture to object
            omni.kit.commands.execute(
                "BindMaterialCommand",
                prim_path=obj_path,
                material_path=texture_path
            )

# Usage example
mat_randomizer = MaterialRandomizer()
materials = ["/World/Materials/Floor", "/World/Materials/Walls", "/World/Materials/Objects"]
mat_randomizer.randomize_materials(materials)
```

### Environment Randomization

```python
# Example: Implementing environment domain randomization
class EnvironmentRandomizer:
    def __init__(self):
        self.weather_conditions = ["clear", "overcast", "rainy", "foggy"]
        self.time_periods = ["dawn", "morning", "noon", "afternoon", "evening", "night"]
        self.background_scenes = [
            "office_interior",
            "warehouse",
            "outdoor_street",
            "indoor_gym",
            "corridor"
        ]

    def randomize_environment(self):
        """
        Randomize environmental conditions
        """
        # Randomize weather
        weather = random.choice(self.weather_conditions)
        self.set_weather_condition(weather)

        # Randomize time of day
        time_period = random.choice(self.time_periods)
        self.set_time_of_day(time_period)

        # Randomize background scene
        background = random.choice(self.background_scenes)
        self.set_background_scene(background)

    def set_weather_condition(self, weather):
        """
        Set weather-related parameters
        """
        if weather == "clear":
            fog_density = 0.0
            atmosphere_thickness = 1.0
        elif weather == "overcast":
            fog_density = 0.05
            atmosphere_thickness = 1.5
        elif weather == "rainy":
            fog_density = 0.1
            atmosphere_thickness = 1.2
        elif weather == "foggy":
            fog_density = 0.2
            atmosphere_thickness = 0.8

        # Apply fog
        omni.kit.commands.execute(
            "ChangeSettingCommand",
            path="/rtx/render/fog/distance",
            value=1.0 / max(fog_density, 0.001) if fog_density > 0 else 10000
        )

    def set_time_of_day(self, time_period):
        """
        Set time-of-day related lighting
        """
        time_lighting_map = {
            "dawn": {"intensity": 0.8, "temperature": 3500, "direction": (-0.2, 0.8, 0.5)},
            "morning": {"intensity": 1.0, "temperature": 5500, "direction": (0.5, 0.8, 0.3)},
            "noon": {"intensity": 1.2, "temperature": 6500, "direction": (0.8, 0.9, 0.1)},
            "afternoon": {"intensity": 1.0, "temperature": 6000, "direction": (0.7, 0.7, 0.2)},
            "evening": {"intensity": 0.7, "temperature": 3000, "direction": (-0.3, 0.6, 0.7)},
            "night": {"intensity": 0.1, "temperature": 2000, "direction": (0.0, 0.3, -0.9)}
        }

        lighting_params = time_lighting_map[time_period]

        # Update main directional light
        omni.kit.commands.execute(
            "ChangePropertyCommand",
            prop_path="/World/DistantLight.inputs:intensity",
            value=lighting_params["intensity"]
        )
        omni.kit.commands.execute(
            "ChangePropertyCommand",
            prop_path="/World/DistantLight.inputs:color",
            value=self.kelvin_to_rgb(lighting_params["temperature"])
        )
        # Note: Direction change would require TransformPrimCommand

# Usage example
env_randomizer = EnvironmentRandomizer()
env_randomizer.randomize_environment()
```

## Data Annotation and Labeling

### Semantic Segmentation Labels

```python
# Example: Creating semantic segmentation labels
class SemanticSegmentationLabeler:
    def __init__(self):
        self.class_mapping = {
            "robot": 1,
            "human": 2,
            "furniture": 3,
            "wall": 4,
            "floor": 5,
            "ceiling": 6,
            "obstacle": 7,
            "free_space": 8
        }

        # Color mapping for visualization
        self.color_mapping = {
            1: (255, 0, 0),    # Robot - Red
            2: (0, 255, 0),    # Human - Green
            3: (0, 0, 255),    # Furniture - Blue
            4: (128, 128, 128), # Wall - Gray
            5: (255, 255, 0),  # Floor - Yellow
            6: (255, 0, 255),  # Ceiling - Magenta
            7: (0, 255, 255),  # Obstacle - Cyan
            8: (0, 0, 0)       # Free space - Black
        }

    def create_segmentation_labels(self, instance_ids):
        """
        Convert instance IDs to semantic segmentation labels
        """
        semantic_labels = np.zeros_like(instance_ids)

        for instance_id in np.unique(instance_ids):
            if instance_id == 0:  # Background
                continue

            # Map instance to semantic class
            semantic_class = self.get_semantic_class_from_instance(instance_id)
            mask = (instance_ids == instance_id)
            semantic_labels[mask] = semantic_class

        return semantic_labels

    def get_semantic_class_from_instance(self, instance_id):
        """
        Map instance ID to semantic class based on object properties
        """
        # This would typically query the USD stage for object properties
        # For this example, we'll use a simple heuristic
        if instance_id % 10 == 1:  # Robot-like objects
            return self.class_mapping["robot"]
        elif instance_id % 10 == 2:  # Human-like objects
            return self.class_mapping["human"]
        elif instance_id % 10 == 3:  # Furniture
            return self.class_mapping["furniture"]
        else:
            return self.class_mapping["obstacle"]  # Default to obstacle

# Usage example
labeler = SemanticSegmentationLabeler()
```

### Bounding Box Annotations

```python
# Example: Creating bounding box annotations
class BoundingBoxAnnotation:
    def __init__(self):
        self.camera_intrinsics = {
            "fx": 525.0, "fy": 525.0,  # Focal lengths
            "cx": 319.5, "cy": 239.5,  # Principal points
            "width": 640, "height": 480  # Image dimensions
        }

    def create_bounding_boxes(self, object_poses, object_sizes):
        """
        Create 2D bounding boxes from 3D object poses and sizes
        """
        bboxes = []

        for pose, size in zip(object_poses, object_sizes):
            # Convert 3D bounding box to 2D projection
            bbox_2d = self.project_3d_bbox_to_2d(pose, size)

            if bbox_2d is not None:
                bboxes.append({
                    "bbox": bbox_2d,  # [x_min, y_min, x_max, y_max]
                    "class": self.get_object_class(pose),  # Object class
                    "confidence": 1.0,  # Perfect confidence in simulation
                    "occlusion": self.calculate_occlusion(bbox_2d, object_poses)  # Visibility
                })

        return bboxes

    def project_3d_bbox_to_2d(self, pose, size):
        """
        Project 3D bounding box to 2D image coordinates
        """
        # Unpack pose (position and rotation)
        pos = pose[:3]  # [x, y, z]
        rot = pose[3:]  # [qx, qy, qz, qw] quaternion

        # Calculate 8 corners of 3D bounding box
        half_size = np.array(size) / 2.0
        corners_3d = np.array([
            [pos[0] - half_size[0], pos[1] - half_size[1], pos[2] - half_size[2]],  # Front-bottom-left
            [pos[0] + half_size[0], pos[1] - half_size[1], pos[2] - half_size[2]],  # Front-bottom-right
            [pos[0] - half_size[0], pos[1] + half_size[1], pos[2] - half_size[2]],  # Front-top-left
            [pos[0] + half_size[0], pos[1] + half_size[1], pos[2] - half_size[2]],  # Front-top-right
            [pos[0] - half_size[0], pos[1] - half_size[1], pos[2] + half_size[2]],  # Back-bottom-left
            [pos[0] + half_size[0], pos[1] - half_size[1], pos[2] + half_size[2]],  # Back-bottom-right
            [pos[0] - half_size[0], pos[1] + half_size[1], pos[2] + half_size[2]],  # Back-top-left
            [pos[0] + half_size[0], pos[1] + half_size[1], pos[2] + half_size[2]]   # Back-top-right
        ])

        # Transform corners by pose rotation
        rotation_matrix = self.quaternion_to_rotation_matrix(rot)
        corners_3d_transformed = np.dot(corners_3d - pos, rotation_matrix.T) + pos

        # Project 3D points to 2D image coordinates
        corners_2d = []
        for corner in corners_3d_transformed:
            # Apply perspective projection
            x_norm = corner[0] / corner[2]  # Normalize by depth
            y_norm = corner[1] / corner[2]  # Normalize by depth

            # Convert to pixel coordinates
            x_pix = x_norm * self.camera_intrinsics["fx"] + self.camera_intrinsics["cx"]
            y_pix = y_norm * self.camera_intrinsics["fy"] + self.camera_intrinsics["cy"]

            corners_2d.append([x_pix, y_pix])

        # Calculate 2D bounding box from projected corners
        xs = [corner[0] for corner in corners_2d]
        ys = [corner[1] for corner in corners_2d]

        x_min, x_max = min(xs), max(xs)
        y_min, y_max = min(ys), max(ys)

        # Clamp to image boundaries
        x_min = max(0, min(self.camera_intrinsics["width"], x_min))
        x_max = max(0, min(self.camera_intrinsics["width"], x_max))
        y_min = max(0, min(self.camera_intrinsics["height"], y_min))
        y_max = max(0, min(self.camera_intrinsics["height"], y_max))

        # Return None if box is outside image
        if x_max <= x_min or y_max <= y_min:
            return None

        return [x_min, y_min, x_max, y_max]

    def quaternion_to_rotation_matrix(self, quat):
        """
        Convert quaternion to rotation matrix
        """
        x, y, z, w = quat

        # Calculate rotation matrix elements
        xx, xy, xz = 2 * x * x, 2 * x * y, 2 * x * z
        yy, yz, zz = 2 * y * y, 2 * y * z, 2 * z * z
        wx, wy, wz = 2 * w * x, 2 * w * y, 2 * w * z

        rotation_matrix = np.array([
            [1 - (yy + zz), xy - wz, xz + wy],
            [xy + wz, 1 - (xx + zz), yz - wx],
            [xz - wy, yz + wx, 1 - (xx + yy)]
        ])

        return rotation_matrix

    def get_object_class(self, pose):
        """
        Determine object class based on position or other properties
        """
        # Simplified class determination
        if pose[2] < 1.0:  # Close to ground
            return "obstacle"
        elif pose[2] < 2.0:  # Medium height
            return "furniture"
        else:  # High objects
            return "structure"

# Usage example
bbox_annotator = BoundingBoxAnnotation()
poses = [[1.0, 2.0, 0.5, 0, 0, 0, 1], [3.0, 1.0, 1.0, 0, 0, 0, 1]]  # [x, y, z, qx, qy, qz, qw]
sizes = [[0.5, 0.5, 0.5], [1.0, 1.0, 1.0]]
bboxes = bbox_annotator.create_bounding_boxes(poses, sizes)
```

## Data Quality and Validation

### Synthetic Data Quality Metrics

```python
# Example: Evaluating synthetic data quality
class SyntheticDataQualityEvaluator:
    def __init__(self):
        self.metrics = {}

    def evaluate_data_quality(self, dataset_path):
        """
        Evaluate the quality of generated synthetic data
        """
        # Load dataset statistics
        stats = self.compute_dataset_statistics(dataset_path)

        # Evaluate diversity metrics
        diversity_score = self.evaluate_diversity(stats)

        # Evaluate realism metrics
        realism_score = self.evaluate_realism(stats)

        # Evaluate annotation quality
        annotation_quality = self.evaluate_annotations(dataset_path)

        # Calculate overall quality score
        overall_quality = self.calculate_overall_quality(
            diversity_score,
            realism_score,
            annotation_quality
        )

        self.metrics = {
            "diversity_score": diversity_score,
            "realism_score": realism_score,
            "annotation_quality": annotation_quality,
            "overall_quality": overall_quality,
            "dataset_statistics": stats
        }

        return self.metrics

    def compute_dataset_statistics(self, dataset_path):
        """
        Compute statistical properties of the dataset
        """
        import cv2
        import os

        image_stats = {"mean_brightness": [], "contrast": [], "color_variance": []}
        label_stats = {"object_counts": [], "class_distribution": {}}

        image_dir = os.path.join(dataset_path, "images")
        label_dir = os.path.join(dataset_path, "labels")

        for filename in os.listdir(image_dir):
            if filename.endswith('.png') or filename.endswith('.jpg'):
                # Load image
                img_path = os.path.join(image_dir, filename)
                img = cv2.imread(img_path)

                # Calculate brightness
                gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
                mean_brightness = np.mean(gray)
                image_stats["mean_brightness"].append(mean_brightness)

                # Calculate contrast (std dev of grayscale)
                contrast = np.std(gray)
                image_stats["contrast"].append(contrast)

                # Calculate color variance
                color_var = np.var(img, axis=(0, 1))
                image_stats["color_variance"].append(color_var)

        return {
            "image_stats": {
                "brightness_mean": np.mean(image_stats["mean_brightness"]),
                "brightness_std": np.std(image_stats["mean_brightness"]),
                "contrast_mean": np.mean(image_stats["contrast"]),
                "contrast_std": np.std(image_stats["contrast"]),
                "color_variance_mean": np.mean(image_stats["color_variance"], axis=0),
                "total_images": len(image_stats["mean_brightness"])
            }
        }

    def evaluate_diversity(self, stats):
        """
        Evaluate the diversity of the dataset
        """
        # Calculate diversity based on statistical variance
        brightness_diversity = stats["image_stats"]["brightness_std"] / max(stats["image_stats"]["brightness_mean"], 0.001)
        contrast_diversity = stats["image_stats"]["contrast_std"] / max(stats["image_stats"]["contrast_mean"], 0.001)

        # Average diversity metrics
        diversity_score = (brightness_diversity + contrast_diversity) / 2.0

        # Normalize to 0-1 scale
        diversity_score = min(diversity_score, 1.0)

        return diversity_score

    def evaluate_realism(self, stats):
        """
        Evaluate the realism of synthetic images
        """
        # For synthetic data, we can evaluate against known real-world statistics
        # This is a simplified example
        brightness_mean = stats["image_stats"]["brightness_mean"]

        # Realistic brightness range (would be calibrated from real data)
        realistic_brightness_range = (50, 200)  # Adjust based on real data

        if realistic_brightness_range[0] <= brightness_mean <= realistic_brightness_range[1]:
            realism_score = 1.0
        else:
            # Score decreases as we move away from realistic range
            distance = min(
                abs(brightness_mean - realistic_brightness_range[0]),
                abs(brightness_mean - realistic_brightness_range[1])
            )
            realism_score = max(0, 1.0 - distance / 100.0)  # Adjust normalization factor

        return realism_score

    def evaluate_annotations(self, dataset_path):
        """
        Evaluate the quality of annotations
        """
        # Check for annotation completeness and correctness
        label_dir = os.path.join(dataset_path, "labels")
        metadata_dir = os.path.join(dataset_path, "metadata")

        total_files = 0
        annotated_files = 0

        for filename in os.listdir(label_dir):
            if filename.endswith('.png'):
                total_files += 1

                # Check if corresponding metadata exists
                meta_filename = filename.replace('.png', '.json').replace('seg_', 'meta_')
                meta_path = os.path.join(metadata_dir, meta_filename)

                if os.path.exists(meta_path):
                    annotated_files += 1

        annotation_quality = annotated_files / max(total_files, 1)
        return annotation_quality

    def calculate_overall_quality(self, diversity, realism, annotations):
        """
        Calculate overall dataset quality
        """
        # Weighted average of quality metrics
        weights = [0.3, 0.4, 0.3]  # diversity, realism, annotations
        metrics = [diversity, realism, annotations]

        overall_quality = sum(w * m for w, m in zip(weights, metrics))
        return overall_quality

# Usage example
evaluator = SyntheticDataQualityEvaluator()
quality_metrics = evaluator.evaluate_data_quality("robotics_synthetic_dataset")
print(f"Dataset Quality: {quality_metrics['overall_quality']:.2f}")
```

## Data Format Standards

### COCO Format for Robotics

```python
# Example: Converting synthetic data to COCO format
import json

class COCOFormatter:
    def __init__(self):
        self.categories = [
            {"id": 1, "name": "robot", "supercategory": "robot"},
            {"id": 2, "name": "human", "supercategory": "person"},
            {"id": 3, "name": "furniture", "supercategory": "object"},
            {"id": 4, "name": "obstacle", "supercategory": "object"}
        ]

    def convert_to_coco_format(self, dataset_path, output_path):
        """
        Convert synthetic dataset to COCO format
        """
        coco_dataset = {
            "info": {
                "year": 2025,
                "version": "1.0",
                "description": "Synthetic Robotics Dataset from Isaac Sim",
                "contributor": "NVIDIA Isaac Sim",
                "url": "",
                "date_created": "2025-12-18"
            },
            "licenses": [
                {
                    "id": 1,
                    "name": "Synthetic Data License",
                    "url": ""
                }
            ],
            "categories": self.categories,
            "images": [],
            "annotations": []
        }

        # Process each image in the dataset
        image_dir = os.path.join(dataset_path, "images")
        label_dir = os.path.join(dataset_path, "labels")
        meta_dir = os.path.join(dataset_path, "metadata")

        image_id = 1
        annotation_id = 1

        for img_file in os.listdir(image_dir):
            if img_file.endswith(('.png', '.jpg')):
                # Add image entry
                img_path = os.path.join(image_dir, img_file)
                img_metadata_path = os.path.join(meta_dir, img_file.replace('.png', '.json').replace('.jpg', '.json'))

                # Get image dimensions (simplified)
                # In practice, you'd use PIL or OpenCV to get actual dimensions
                width, height = 640, 480  # Default dimensions

                image_entry = {
                    "id": image_id,
                    "width": width,
                    "height": height,
                    "file_name": img_file,
                    "license": 1,
                    "flickr_url": "",
                    "coco_url": "",
                    "date_captured": "2025-12-18"
                }
                coco_dataset["images"].append(image_entry)

                # Process corresponding segmentation mask for annotations
                seg_file = img_file.replace('.png', '_seg.png').replace('.jpg', '_seg.png')
                seg_path = os.path.join(label_dir, seg_file)

                if os.path.exists(seg_path):
                    # Create annotations from segmentation mask
                    annotations = self.create_annotations_from_mask(
                        seg_path, image_id, annotation_id
                    )

                    coco_dataset["annotations"].extend(annotations)
                    annotation_id += len(annotations)

                image_id += 1

        # Save COCO-formatted dataset
        with open(output_path, 'w') as f:
            json.dump(coco_dataset, f, indent=2)

        print(f"COCO dataset saved to {output_path}")
        print(f"Total images: {len(coco_dataset['images'])}")
        print(f"Total annotations: {len(coco_dataset['annotations'])}")

    def create_annotations_from_mask(self, mask_path, image_id, start_annotation_id):
        """
        Create COCO annotations from segmentation mask
        """
        import cv2
        import numpy as np

        # Load segmentation mask
        seg_mask = cv2.imread(mask_path, cv2.IMREAD_GRAYSCALE)

        annotations = []
        annotation_id = start_annotation_id

        # Find unique segment IDs (excluding background)
        unique_ids = np.unique(seg_mask)
        unique_ids = unique_ids[unique_ids != 0]  # Exclude background

        for seg_id in unique_ids:
            # Create binary mask for this segment
            binary_mask = (seg_mask == seg_id).astype(np.uint8)

            # Find contours to get bounding box and segmentation polygon
            contours, _ = cv2.findContours(binary_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

            if len(contours) > 0:
                # Use largest contour
                largest_contour = max(contours, key=cv2.contourArea)

                # Calculate bounding box
                x, y, w, h = cv2.boundingRect(largest_contour)

                # Calculate area
                area = float(cv2.contourArea(largest_contour))

                # Approximate contour to reduce polygon complexity
                epsilon = 0.01 * cv2.arcLength(largest_contour, True)
                approx_contour = cv2.approxPolyDP(largest_contour, epsilon, True)

                # Flatten contour points for COCO format
                segmentation = []
                for point in approx_contour.reshape(-1, 2):
                    segmentation.extend([float(point[0]), float(point[1])])

                # Determine category based on segment ID
                category_id = self.get_category_from_segment_id(seg_id)

                annotation = {
                    "id": annotation_id,
                    "image_id": image_id,
                    "category_id": category_id,
                    "segmentation": [segmentation],
                    "area": area,
                    "bbox": [float(x), float(y), float(w), float(h)],
                    "iscrowd": 0
                }

                annotations.append(annotation)
                annotation_id += 1

        return annotations

    def get_category_from_segment_id(self, seg_id):
        """
        Map segment ID to COCO category ID
        """
        # Simplified mapping - in practice, this would be more sophisticated
        if seg_id % 4 == 1:
            return 1  # robot
        elif seg_id % 4 == 2:
            return 2  # human
        elif seg_id % 4 == 3:
            return 3  # furniture
        else:
            return 4  # obstacle

# Usage example
formatter = COCOFormatter()
formatter.convert_to_coco_format(
    "robotics_synthetic_dataset",
    "robotics_dataset_coco.json"
)
```

## Assessment Questions

1. What are the key advantages of synthetic data generation in robotics AI?
2. How does domain randomization improve the generalization of AI models?
3. What are the important components of a synthetic data generation pipeline?
4. How can you validate the quality of generated synthetic datasets?
5. What are the standard formats for storing synthetic robotics data?

## Next Steps

After mastering synthetic data generation concepts, continue to the Environment Configuration section to learn about setting up lighting, materials, and physics for optimal synthetic data generation.
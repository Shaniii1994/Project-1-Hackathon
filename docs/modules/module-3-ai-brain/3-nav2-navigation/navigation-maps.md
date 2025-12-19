# Navigation Maps for Humanoid Robots

This section covers the creation and management of navigation maps specifically optimized for humanoid robot navigation using Isaac ROS and Nav2.

## Understanding Navigation Maps for Humanoids

### Map Requirements for Humanoid Navigation

Navigation maps for humanoid robots have different requirements compared to wheeled robots:

1. **Step Height Considerations**: Maps must account for step height limitations
2. **Terrain Passability**: Different terrain types affect humanoid mobility
3. **Footstep Planning**: Maps need to support discrete footstep planning
4. **Balance Zones**: Identification of stable standing areas

### Map Types for Humanoid Navigation

- **2D Costmaps**: Traditional occupancy grid maps with humanoid-specific costs
- **3D Costmaps**: Volumetric maps accounting for humanoid dimensions
- **Traversability Maps**: Maps indicating terrain suitability for humanoid locomotion
- **Footstep Maps**: Maps optimized for discrete footstep planning

## Creating Humanoid-Optimized Maps

### Map Resolution Considerations

For humanoid robots, map resolution should account for:
- Robot footprint size (typically larger than wheeled robots)
- Step size limitations
- Balance constraints
- Obstacle clearance requirements

```yaml
# Example: Humanoid-optimized map configuration
map_server:
  ros__parameters:
    use_sim_time: true
    yaml_filename: "humanoid_map.yaml"

    # Map resolution optimized for humanoid navigation
    topic_name: map
    frame_id: map
    resolution: 0.05  # Higher resolution for detailed terrain analysis

    # Map loading parameters
    always_send_full_map: false
    subscribe_to_updates: true

    # Map saving parameters
    map_save_server:
      save_map_timeout: 5.0
      free_thresh_default: 0.25
      occupied_thresh_default: 0.65
```

### Traversability Analysis

Humanoid robots require specialized traversability analysis:

```python
# Example: Humanoid traversability analysis
import numpy as np
from nav_msgs.msg import OccupancyGrid
from geometry_msgs.msg import Point

class HumanoidTraversabilityAnalyzer:
    def __init__(self):
        self.step_height_limit = 0.15  # 15cm step height limit
        self.step_width_limit = 0.30  # 30cm step width limit
        self.slope_limit = 15.0       # 15 degree slope limit

    def analyze_traversability(self, elevation_map, occupancy_grid):
        """
        Analyze traversability for humanoid robot based on elevation and occupancy data
        """
        traversability_map = np.zeros_like(occupancy_grid.data, dtype=np.float32)

        height, width = elevation_map.shape

        for y in range(1, height-1):
            for x in range(1, width-1):
                if occupancy_grid.data[y * width + x] > 50:  # Occupied cell
                    traversability_map[y * width + x] = 0.0  # Not traversable
                    continue

                # Check step height between adjacent cells
                neighbor_heights = []
                for dy, dx in [(-1,0), (1,0), (0,-1), (0,1)]:  # 4-connected neighbors
                    ny, nx = y + dy, x + dx
                    if 0 <= ny < height and 0 <= nx < width:
                        neighbor_heights.append(elevation_map[ny, nx])

                # Check if step height is within limits
                current_height = elevation_map[y, x]
                max_step_height = max(abs(current_height - nh) for nh in neighbor_heights) if neighbor_heights else 0

                if max_step_height > self.step_height_limit:
                    traversability_map[y * width + x] = 0.2  # Difficult but possible
                else:
                    # Calculate local slope
                    slope = self.calculate_local_slope(elevation_map, x, y)

                    if slope > self.slope_limit:
                        traversability_map[y * width + x] = 0.3  # Challenging terrain
                    else:
                        traversability_map[y * width + x] = 1.0  # Fully traversable

        return traversability_map

    def calculate_local_slope(self, elevation_map, x, y):
        """
        Calculate local slope at given coordinates
        """
        height, width = elevation_map.shape

        # Use 3x3 neighborhood for slope calculation
        neighbors = []
        for dy in [-1, 0, 1]:
            for dx in [-1, 0, 1]:
                if dy == 0 and dx == 0:
                    continue  # Skip center pixel
                ny, nx = y + dy, x + dx
                if 0 <= ny < height and 0 <= nx < width:
                    neighbors.append((nx, ny, elevation_map[ny, nx]))

        if len(neighbors) < 4:
            return 0.0  # Not enough neighbors

        # Calculate slope using least squares fit
        points = [(x, y, elevation_map[y, x])]
        points.extend([(nx, ny, elev) for nx, ny, elev in neighbors])

        # Fit plane to points and calculate slope
        # This is a simplified approach - in practice, more sophisticated methods are used
        avg_z = sum(p[2] for p in points) / len(points)

        # Calculate maximum height difference in neighborhood
        max_diff = max(abs(p[2] - avg_z) for p in points)

        # Convert to slope angle (simplified)
        if len(points) > 1:
            # Approximate slope as rise over run
            max_run = 1.0  # Grid cell size
            slope_degrees = np.arctan(max_diff / max_run) * 180.0 / np.pi
            return slope_degrees

        return 0.0

# Example: Map preprocessing for humanoid navigation
class HumanoidMapPreprocessor:
    def __init__(self):
        self.traversability_analyzer = HumanoidTraversabilityAnalyzer()

    def preprocess_map(self, original_map):
        """
        Preprocess map for humanoid navigation
        """
        # Convert to numpy array for processing
        map_array = np.array(original_map.data).reshape(
            original_map.info.height, original_map.info.width
        )

        # Apply humanoid-specific filtering
        filtered_map = self.apply_humanoid_filtering(map_array)

        # Generate traversability map
        traversability_map = self.traversability_analyzer.analyze_traversability(
            self.estimate_elevation_map(original_map),
            original_map
        )

        # Combine occupancy and traversability information
        combined_map = self.combine_maps(map_array, traversability_map)

        # Update map metadata for humanoid navigation
        processed_map = self.update_map_metadata(original_map, combined_map)

        return processed_map

    def apply_humanoid_filtering(self, map_array):
        """
        Apply humanoid-specific filtering to map
        """
        # Dilate obstacles to account for humanoid size
        from scipy import ndimage

        # Create structuring element for humanoid footprint
        # Assuming humanoid footprint is roughly 60x40 cm
        footprint_radius = max(1, int(0.30 / map.info.resolution))  # Convert to cells

        structure = ndimage.generate_binary_structure(2, 2)
        structure = ndimage.iterate_structure(structure, footprint_radius)

        # Dilate obstacles
        dilated_map = ndimage.binary_dilation(map_array > 50, structure=structure)

        # Convert back to occupancy values
        filtered_map = map_array.copy()
        filtered_map[dilated_map] = 100  # Mark as occupied

        return filtered_map

    def estimate_elevation_map(self, occupancy_map):
        """
        Estimate elevation map from occupancy data (simplified approach)
        In practice, this would use 3D sensor data
        """
        # This is a placeholder - in practice, elevation data would come from 3D sensors
        elevation_map = np.zeros((occupancy_map.info.height, occupancy_map.info.width))

        # For demonstration, create some artificial elevation variation
        for y in range(occupancy_map.info.height):
            for x in range(occupancy_map.info.width):
                # Create some artificial elevation based on position
                elevation_map[y, x] = np.sin(x * 0.1) * np.cos(y * 0.1) * 0.1  # Small variations

        return elevation_map

    def combine_maps(self, occupancy_map, traversability_map):
        """
        Combine occupancy and traversability information
        """
        # Create weighted combination
        # Occupancy: 0 (free) to 100 (occupied)
        # Traversability: 0 (impassable) to 1 (fully traversable)

        combined = occupancy_map.copy().astype(np.float32)

        # Adjust for traversability
        for i in range(len(combined)):
            if combined[i] < 50:  # Only adjust free space
                traversability_weight = traversability_map[i]
                # Higher cost for less traversable areas
                combined[i] = combined[i] * (2.0 - traversability_weight)

        # Ensure values stay within valid range
        combined = np.clip(combined, 0, 100)

        return combined.astype(np.int8)

    def update_map_metadata(self, original_map, processed_data):
        """
        Update map metadata with humanoid-specific information
        """
        processed_map = OccupancyGrid()
        processed_map.header = original_map.header
        processed_map.header.frame_id = "map"
        processed_map.info = original_map.info
        processed_map.data = processed_data.flatten().tolist()

        return processed_map
```

### Semantic Map Integration

Humanoid robots benefit from semantic maps that include contextual information:

```python
# Example: Semantic map integration for humanoid navigation
class SemanticMapIntegrator:
    def __init__(self):
        self.semantic_classes = {
            0: "unknown",
            1: "free_space",
            2: "obstacle",
            3: "stairs",
            4: "ramp",
            5: "elevator",
            6: "doorway",
            7: "narrow_passage",
            8: "wide_area",
            9: "furniture",
            10: "humanoid_only_zone"
        }

    def create_semantic_map(self, base_map, semantic_annotations):
        """
        Create semantic map by combining base occupancy with semantic annotations
        """
        semantic_map = np.full_like(base_map.data, 0, dtype=np.uint8)  # Unknown initially

        for annotation in semantic_annotations:
            # Convert annotation coordinates to map indices
            x_idx = int((annotation.center.x - base_map.info.origin.position.x) / base_map.info.resolution)
            y_idx = int((annotation.center.y - base_map.info.origin.position.y) / base_map.info.resolution)

            # Apply semantic label to map cell
            if 0 <= x_idx < base_map.info.width and 0 <= y_idx < base_map.info.height:
                map_idx = y_idx * base_map.info.width + x_idx
                semantic_map[map_idx] = annotation.semantic_class

        return semantic_map

    def plan_semantic_aware_path(self, start_pose, goal_pose, semantic_map, base_map):
        """
        Plan path considering semantic information
        """
        # Use A* or other path planning algorithm with semantic cost function
        from heapq import heappush, heappop

        def get_neighbors(cell_idx):
            """Get valid neighboring cells"""
            y, x = divmod(cell_idx, base_map.info.width)
            neighbors = []

            for dy, dx in [(-1,0), (1,0), (0,-1), (0,1), (-1,-1), (-1,1), (1,-1), (1,1)]:
                ny, nx = y + dy, x + dx
                if 0 <= ny < base_map.info.height and 0 <= nx < base_map.info.width:
                    neighbor_idx = ny * base_map.info.width + nx
                    neighbors.append(neighbor_idx)

            return neighbors

        def heuristic(cell_idx1, cell_idx2):
            """Calculate heuristic distance between cells"""
            y1, x1 = divmod(cell_idx1, base_map.info.width)
            y2, x2 = divmod(cell_idx2, base_map.info.width)
            return abs(x1 - x2) + abs(y1 - y2)  # Manhattan distance

        def get_cost(from_idx, to_idx):
            """Calculate movement cost considering semantic information"""
            semantic_class = semantic_map[to_idx]
            base_cost = 1.0

            # Adjust cost based on semantic class
            if semantic_class == 3:  # Stairs
                base_cost *= 2.0  # More expensive for humanoid
            elif semantic_class == 4:  # Ramp
                base_cost *= 1.5  # Still challenging but more feasible
            elif semantic_class == 7:  # Narrow passage
                base_cost *= 1.8  # Challenging for humanoid width
            elif semantic_class == 10:  # Humanoid-only zone
                base_cost *= 0.5  # Preferred path
            elif semantic_class == 2:  # Obstacle
                return float('inf')  # Not passable

            # Also consider base occupancy cost
            occupancy_cost = base_map.data[to_idx] / 100.0
            total_cost = base_cost * (1.0 + occupancy_cost)

            return total_cost

        # A* path planning algorithm
        start_idx = int((start_pose.position.y - base_map.info.origin.position.y) / base_map.info.resolution) * base_map.info.width + \
                   int((start_pose.position.x - base_map.info.origin.position.x) / base_map.info.resolution)

        goal_idx = int((goal_pose.position.y - base_map.info.origin.position.y) / base_map.info.resolution) * base_map.info.width + \
                  int((goal_pose.position.x - base_map.info.origin.position.x) / base_map.info.resolution)

        # Initialize A* algorithm
        open_set = [(0, start_idx)]
        came_from = {}
        g_score = {start_idx: 0}
        f_score = {start_idx: heuristic(start_idx, goal_idx)}

        while open_set:
            current = heappop(open_set)[1]

            if current == goal_idx:
                # Reconstruct path
                path = []
                while current in came_from:
                    path.append(current)
                    current = came_from[current]
                path.reverse()
                return path

            for neighbor in get_neighbors(current):
                tentative_g_score = g_score[current] + get_cost(current, neighbor)

                if neighbor not in g_score or tentative_g_score < g_score[neighbor]:
                    came_from[neighbor] = current
                    g_score[neighbor] = tentative_g_score
                    f_score[neighbor] = tentative_g_score + heuristic(neighbor, goal_idx)
                    heappush(open_set, (f_score[neighbor], neighbor))

        # No path found
        return None
```

## Isaac ROS Map Integration

### GPU-Accelerated Map Processing

Isaac ROS provides GPU acceleration for map processing operations:

```python
# Example: Isaac ROS GPU-accelerated map processing
import cupy as cp  # CUDA-accelerated NumPy
import numpy as np

class IsaacROSMapProcessor:
    def __init__(self):
        self.use_gpu = True  # Enable GPU acceleration if available

    def process_map_gpu(self, occupancy_map_cpu):
        """
        Process occupancy map using GPU acceleration
        """
        if not self.use_gpu:
            return self.process_map_cpu(occupancy_map_cpu)

        try:
            # Transfer map to GPU
            occupancy_map_gpu = cp.asarray(occupancy_map_cpu)

            # Apply GPU-accelerated operations
            processed_map_gpu = self.gpu_map_operations(occupancy_map_gpu)

            # Transfer result back to CPU
            processed_map_cpu = cp.asnumpy(processed_map_gpu)

            return processed_map_cpu

        except ImportError:
            # Fall back to CPU processing if CuPy not available
            self.use_gpu = False
            return self.process_map_cpu(occupancy_map_cpu)

    def gpu_map_operations(self, map_gpu):
        """
        Apply map operations using GPU acceleration
        """
        # Example: GPU-accelerated morphological operations
        # Dilate obstacles using GPU
        from cupyx.scipy import ndimage as cp_ndimage

        # Create structuring element
        structure = cp.ones((3, 3), dtype=bool)

        # Apply dilation
        dilated_map = cp_ndimage.binary_dilation(map_gpu > 50, structure=structure)

        # Combine with original map
        result_map = cp.where(dilated_map, 100, map_gpu)

        return result_map

    def create_traversability_map_gpu(self, elevation_map, occupancy_map):
        """
        Create traversability map using GPU acceleration
        """
        if not self.use_gpu:
            return self.create_traversability_map_cpu(elevation_map, occupancy_map)

        try:
            # Transfer to GPU
            elevation_gpu = cp.asarray(elevation_map)
            occupancy_gpu = cp.asarray(occupancy_map)

            # Calculate traversability using GPU kernels
            traversability_gpu = self.gpu_traversability_analysis(
                elevation_gpu, occupancy_gpu
            )

            # Transfer back to CPU
            traversability_cpu = cp.asnumpy(traversability_gpu)

            return traversability_cpu

        except ImportError:
            # Fall back to CPU
            self.use_gpu = False
            return self.create_traversability_map_cpu(elevation_map, occupancy_map)

    def gpu_traversability_analysis(self, elevation_gpu, occupancy_gpu):
        """
        GPU kernel for traversability analysis
        """
        # Use CuPy for GPU-accelerated array operations
        height, width = elevation_gpu.shape

        # Calculate gradients using GPU
        grad_x, grad_y = cp.gradient(elevation_gpu)

        # Calculate slope magnitude
        slope_magnitude = cp.sqrt(grad_x**2 + grad_y**2)

        # Convert to degrees
        slope_degrees = cp.arctan(slope_magnitude) * 180.0 / cp.pi

        # Create traversability map based on slope and occupancy
        traversability = cp.ones_like(occupancy_gpu, dtype=cp.float32)

        # Reduce traversability for steep slopes
        high_slope = slope_degrees > 15.0  # 15 degree limit
        traversability[high_slope] = 0.3  # Low traversability for steep areas

        # Mark occupied areas as non-traversable
        occupied = occupancy_gpu > 50
        traversability[occupied] = 0.0

        return traversability
```

## Map Validation and Quality Assurance

### Map Quality Metrics

```python
# Example: Map quality validation for humanoid navigation
class MapQualityValidator:
    def __init__(self):
        self.quality_thresholds = {
            'map_completeness': 0.8,      # 80% of expected area mapped
            'obstacle_density': 0.3,      # Reasonable obstacle density
            'traversable_ratio': 0.6,     # 60% of map should be traversable
            'map_resolution': 0.1,        # Maximum resolution (meters/cell)
            'map_consistency': 0.95       # 95% consistency across measurements
        }

    def validate_map_quality(self, map_data):
        """
        Validate map quality for humanoid navigation
        """
        quality_metrics = {}

        # Calculate map completeness
        unknown_cells = np.sum(map_data.data == -1)  # -1 typically indicates unknown
        total_cells = len(map_data.data)
        completeness = 1.0 - (unknown_cells / total_cells)
        quality_metrics['completeness'] = completeness

        # Calculate traversable area ratio
        traversable_cells = np.sum((np.array(map_data.data) >= 0) & (np.array(map_data.data) < 50))
        traversable_ratio = traversable_cells / total_cells
        quality_metrics['traversable_ratio'] = traversable_ratio

        # Calculate obstacle density
        obstacle_cells = np.sum(np.array(map_data.data) >= 50)
        obstacle_density = obstacle_cells / total_cells
        quality_metrics['obstacle_density'] = obstacle_density

        # Check resolution
        quality_metrics['resolution'] = map_data.info.resolution

        # Calculate map consistency (simplified)
        # In practice, this would compare with multiple map acquisitions
        quality_metrics['consistency'] = self.assess_map_consistency(map_data)

        # Overall quality score
        quality_score = self.calculate_overall_quality_score(quality_metrics)
        quality_metrics['overall_quality'] = quality_score

        return quality_metrics, quality_score >= 0.8  # Pass if quality score > 80%

    def assess_map_consistency(self, map_data):
        """
        Assess map consistency (simplified approach)
        """
        # Calculate local consistency by comparing neighboring cells
        map_array = np.array(map_data.data).reshape(map_data.info.height, map_data.info.width)

        consistent_changes = 0
        total_comparisons = 0

        for y in range(1, map_data.info.height - 1):
            for x in range(1, map_data.info.width - 1):
                center_cell = map_array[y, x]

                # Compare with neighbors
                for dy, dx in [(-1,0), (1,0), (0,-1), (0,1)]:
                    neighbor_cell = map_array[y + dy, x + dx]

                    # Count as consistent if difference is reasonable
                    if abs(center_cell - neighbor_cell) <= 20:  # Allow some variation
                        consistent_changes += 1
                    total_comparisons += 1

        consistency = consistent_changes / max(total_comparisons, 1)
        return consistency

    def calculate_overall_quality_score(self, metrics):
        """
        Calculate overall map quality score
        """
        weights = {
            'completeness': 0.25,
            'traversable_ratio': 0.20,
            'obstacle_density': 0.15,
            'resolution': 0.20,  # Inverted (higher resolution = better)
            'consistency': 0.20
        }

        score = 0.0

        # Completeness score
        completeness_score = min(metrics['completeness'] / self.quality_thresholds['map_completeness'], 1.0)
        score += weights['completeness'] * completeness_score

        # Traversable ratio score
        ratio_score = min(metrics['traversable_ratio'] / self.quality_thresholds['traversable_ratio'], 1.0)
        score += weights['traversable_ratio'] * ratio_score

        # Obstacle density score (should be within reasonable bounds)
        density_score = 1.0 - abs(metrics['obstacle_density'] - 0.2) / 0.2  # Target around 20%
        density_score = max(0.0, min(1.0, density_score))
        score += weights['obstacle_density'] * density_score

        # Resolution score (lower is better, so invert)
        resolution_score = max(0.0, min(1.0, self.quality_thresholds['map_resolution'] / max(metrics['resolution'], 0.001)))
        score += weights['resolution'] * resolution_score

        # Consistency score
        consistency_score = min(metrics['consistency'] / self.quality_thresholds['map_consistency'], 1.0)
        score += weights['consistency'] * consistency_score

        return score
```

## Best Practices for Humanoid Navigation Maps

### Map Creation Guidelines

1. **Resolution Selection**: Choose resolution based on robot step size and obstacle detection capabilities
2. **Semantic Annotation**: Include semantic information relevant to humanoid navigation
3. **Multi-layer Mapping**: Consider 3D maps for complex humanoid navigation scenarios
4. **Dynamic Updates**: Implement systems for updating maps as environment changes
5. **Validation**: Regularly validate maps for completeness and accuracy

### Performance Optimization

- **Multi-resolution Maps**: Use different resolutions for different navigation tasks
- **Region of Interest**: Focus computational resources on relevant areas
- **Incremental Updates**: Update only changed portions of the map
- **GPU Acceleration**: Leverage Isaac ROS GPU acceleration for map operations

## Troubleshooting Common Issues

### Issue 1: Poor Path Planning Quality
**Symptoms**: Robot takes inefficient paths or fails to navigate through known passages
**Solutions**:
- Verify map resolution is appropriate for robot size
- Check for incorrectly marked obstacles
- Validate costmap inflation parameters
- Review semantic map annotations

### Issue 2: Localization Failures
**Symptoms**: Robot loses position in map or reports incorrect location
**Solutions**:
- Verify map quality and completeness
- Check sensor calibration and alignment
- Validate AMCL or other localization parameters
- Ensure adequate visual features in environment

### Issue 3: Navigation Failures in Complex Terrain
**Symptoms**: Robot struggles with stairs, ramps, or uneven surfaces
**Solutions**:
- Implement traversability analysis
- Use 3D mapping for complex terrain
- Adjust path planning parameters for humanoid kinematics
- Include semantic annotations for special terrain types

## Assessment Questions

1. What are the key differences between navigation maps for wheeled robots and humanoid robots?
2. How does step height limitation affect map representation for humanoid navigation?
3. What role does semantic mapping play in humanoid robot navigation?
4. How can GPU acceleration improve map processing for humanoid navigation?
5. What are the important quality metrics for validating humanoid navigation maps?

## Next Steps

After mastering navigation maps for humanoid robots, continue to the Obstacle Avoidance section to learn about dynamic obstacle detection and avoidance techniques specifically adapted for humanoid robot kinematics and safety requirements.
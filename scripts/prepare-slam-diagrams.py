"""Compile map snapshots to SVG, with simplified display splines for track driving."""
import json
import math
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

def build(name):
    data = json.loads((ROOT / f"docs/design/reference/car_simulator_llm_snapshot_{name}.json").read_text(encoding="utf-8"))
    graph = data["graph_message"]
    poses = {p["graph_vertex_id"]: p for p in graph["pose_nodes"]}
    landmarks = {p["graph_vertex_id"]: p for p in graph["landmark_nodes"]}
    cones = data["map_message"]["cones"]
    pose = data["pose_message"]
    car = dict(x_m=pose["position_global_m"]["x"], y_m=pose["position_global_m"]["y"])
    yaw = pose["orientation_radians"]
    # Snapshots omit camera configuration. Use the simulator defaults: 110 degrees, 10 m.
    arc = [dict(x_m=car["x_m"] + 10*math.cos(yaw + math.radians(-55 + i*110/32)), y_m=car["y_m"] + 10*math.sin(yaw + math.radians(-55 + i*110/32))) for i in range(33)]
    points = cones + list(poses.values()) + list(landmarks.values()) + arc + [car]
    xs, ys = [-p["y_m"] for p in points], [-p["x_m"] for p in points]
    scale = min(640/max(max(xs)-min(xs), 1), 360/max(max(ys)-min(ys), 1))
    cx, cy = (max(xs)+min(xs))/2, (max(ys)+min(ys))/2
    def xy(p): return (round(360+(-p["y_m"]-cx)*scale, 1), round(220+(-p["x_m"]-cy)*scale, 1))
    def point(p):
        x,y=xy(p); return f"{x},{y}"
    def edge(a,b): return f"M{point(a)}L{point(b)}"
    track_drive = name != "skidpad"
    observation_edges = graph["observation_edges"][::3] if track_drive else graph["observation_edges"]
    edges = '' if track_drive else ''.join(edge(poses[e["source_pose_vertex_id"]], poses[e["target_pose_vertex_id"]]) for e in graph["pose_edges"])
    edges += ''.join(edge(poses[e["pose_vertex_id"]], landmarks[e["landmark_vertex_id"]]) for e in observation_edges)
    def simplify(points, tolerance=.65):
        if len(points) < 3: return points
        a,b=points[0],points[-1]
        dx,dy=b[0]-a[0],b[1]-a[1]
        def distance(p):
            t=max(0,min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/(dx*dx+dy*dy))) if dx or dy else 0
            return math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dy)
        index=max(range(1,len(points)-1),key=lambda i: distance(points[i]))
        if distance(points[index]) <= tolerance: return [a,b]
        return simplify(points[:index+1],tolerance)[:-1]+simplify(points[index:],tolerance)
    def spline(points):
        points=simplify(points)
        if len(points)<2:return ''
        result=f"M{points[0][0]},{points[0][1]}"
        for i in range(len(points)-1):
            a,b,c,d=points[max(0,i-1)],points[i],points[i+1],points[min(len(points)-1,i+2)]
            # Catmull-Rom converted to cubic Bezier segments, in display coordinates.
            control1=[b[k]+(c[k]-a[k])/6 for k in (0,1)]
            control2=[c[k]-(d[k]-b[k])/6 for k in (0,1)]
            result+=f"C{control1[0]:.1f},{control1[1]:.1f} {control2[0]:.1f},{control2[1]:.1f} {c[0]},{c[1]}"
        return result
    # Split at graph gaps and changes of optimisation status; never bridge unrelated poses.
    connections={(e["source_pose_vertex_id"],e["target_pose_vertex_id"]) for e in graph["pose_edges"]}
    runs=[]
    for p in poses.values():
        if not runs or (runs[-1][-1]["graph_vertex_id"],p["graph_vertex_id"]) not in connections or runs[-1][-1]["fixed"] != p["fixed"]:
            runs.append([])
        runs[-1].append(p)
    active_curve=''.join(spline([xy(p) for p in run]) for run in runs if not run[0]["fixed"]) if track_drive else ''
    fixed_curve=''.join(spline([xy(p) for p in run]) for run in runs if run[0]["fixed"]) if track_drive else ''
    def marks(items, radius):
        return ''.join(f"M{x-radius:.1f},{y}h{radius*2}M{x},{y-radius:.1f}v{radius*2}" for x,y in map(xy,items))
    def circles(items):
        return ''.join(f"M{x-1.5:.1f},{y}a1.5,1.5 0 1,0 3,0a1.5,1.5 0 1,0 -3,0" for x,y in map(xy,items))
    recent = list(poses.values())[-12:]
    recent_ids = {p['graph_vertex_id'] for p in recent}
    recent_curve = ''.join(spline([xy(p) for p in run if p['graph_vertex_id'] in recent_ids]) for run in runs)
    return dict(recentCurve=recent_curve, recentPoses='' if track_drive else circles(recent), edges=edges, activeCurve=active_curve, fixedCurve=fixed_curve, blue=marks([c for c in cones if c["type"]=="Blue"],3), yellow=marks([c for c in cones if c["type"]=="Yellow"],3), other=marks([c for c in cones if c["type"] not in ["Blue","Yellow"]],3), fixed=marks([p for p in poses.values() if p["fixed"]],2), active='' if track_drive else circles([p for p in poses.values() if not p["fixed"]]), fov='M'+point(car)+'L'+'L'.join(point(p) for p in arc)+'Z', car=point(car), heading=math.degrees(-yaw)-90, counts=dict(cones=len(cones),poses=len(poses),drawnObservations=len(observation_edges),splineSegments=(active_curve+fixed_curve).count("C"),edges=len(graph["pose_edges"])+len(graph["observation_edges"])))

output = {name:build(name) for name in ["skidpad", "slam_building", "slam_finished"]}
(ROOT / "src/app/features/portfolio/slam-snapshots.ts").write_text("// Generated by scripts/prepare-slam-diagrams.py from supplied snapshots.\nexport const SLAM_SNAPSHOTS = " + json.dumps(output,separators=(',',':')) + " as const;\n",encoding="utf-8")
print({key:value["counts"] for key,value in output.items()})

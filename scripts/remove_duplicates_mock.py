import os
import re
import unicodedata
from collections import Counter

# Keep in sync with scripts/download_reel.py sanitize_filename
def sanitize_filename(text):
    text = unicodedata.normalize("NFD", text)
    text = "".join([c for c in text if not unicodedata.combining(c)])
    text = text.lower()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_]+", "-", text)
    text = text.strip("-")
    return text

def parse_objects(array_str):
    objects = []
    brace_count = 0
    current_obj = []
    for char in array_str:
        if char == '{':
            brace_count += 1
        if brace_count > 0:
            current_obj.append(char)
        if char == '}':
            brace_count -= 1
            if brace_count == 0:
                objects.append("".join(current_obj))
                current_obj = []
    return objects

def parse_fields(obj_str):
    # Escape-aware JS string regex matching
    pattern = r"(\w+):\s*(?:'((?:[^'\\]|\\.)*)'|\"((?:[^\"\\]|\\.)*)\"|(\[[^\]]*\])|(true|false|null|\d+(?:\.\d+)?|new Date\([^\)]*\))|([^,\n]+))"
    fields = {}
    for match in re.finditer(pattern, obj_str):
        key = match.group(1)
        val_sq = match.group(2)
        val_dq = match.group(3)
        val_arr = match.group(4)
        val_lit = match.group(5)
        val_other = match.group(6)
        
        if val_sq is not None:
            # Unescape backslash-escaped single quotes
            unescaped = val_sq.replace("\\'", "'")
            fields[key] = ('string', unescaped)
        elif val_dq is not None:
            # Unescape backslash-escaped double quotes
            unescaped = val_dq.replace('\\"', '"')
            fields[key] = ('string', unescaped)
        elif val_arr is not None:
            fields[key] = ('array', val_arr)
        elif val_lit is not None:
            fields[key] = ('literal', val_lit)
        elif val_other is not None:
            fields[key] = ('literal', val_other.strip())
    return fields

def serialize_fields(fields):
    parts = []
    for key, (type_name, val) in fields.items():
        if type_name == 'string':
            # Escape single quotes and backslashes properly
            escaped_val = val.replace("\\", "\\\\").replace("'", "\\'")
            parts.append(f"    {key}: '{escaped_val}'")
        elif type_name == 'array':
            parts.append(f"    {key}: {val}")
        elif type_name == 'literal':
            parts.append(f"    {key}: {val}")
    return "  {\n" + ",\n".join(parts) + "\n  }"

def clean_file(file_path):
    print(f"\nProcessing file: {file_path}")
    if not os.path.exists(file_path):
        print(f"  [ERROR] File not found: {file_path}")
        return
        
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()
        
    # Find offsets for arrays
    idx_inf = content.find("const mockInfluencers =")
    idx_rest = content.find("const mockRestaurantes =")
    idx_vid = content.find("const mockVideos =")
    idx_plan = content.find("const mockPlanos =")
    
    # Let's parse objects
    infl_block = content[idx_inf:idx_rest]
    rest_block = content[idx_rest:idx_vid]
    vid_block = content[idx_vid:idx_plan]
    
    # For plans, it goes until the end of the declaration or client creation
    next_decl = re.search(r"\n(const|class|function|export)\s", content[idx_plan:])
    if next_decl:
        idx_plan_end = idx_plan + next_decl.start()
    else:
        idx_plan_end = len(content)
        
    plan_block = content[idx_plan:idx_plan_end]
    
    # Parse into lists of string objects
    infl_strs = parse_objects(infl_block)
    rest_strs = parse_objects(rest_block)
    vid_strs = parse_objects(vid_block)
    plan_strs = parse_objects(plan_block)
    
    # Parse strings into Python dicts
    influencers = [parse_fields(x) for x in infl_strs]
    restaurants = [parse_fields(x) for x in rest_strs]
    videos = [parse_fields(x) for x in vid_strs]
    plans = [parse_fields(x) for x in plan_strs]
    
    print(f"  Initial counts: Influencers={len(influencers)}, Restaurants={len(restaurants)}, Videos={len(videos)}, Plans={len(plans)}")
    
    # 1. Deduplicate restaurants by slug
    seen_rest_slugs = {}
    clean_restaurants = []
    redirect_rest_ids = {} # maps duplicate_id -> original_id
    
    for r in restaurants:
        slug = r['slug'][1]
        r_id = r['id'][1]
        
        if slug in seen_rest_slugs:
            # Duplicate found! Redirect to first one
            original_id = seen_rest_slugs[slug]
            redirect_rest_ids[r_id] = original_id
        else:
            seen_rest_slugs[slug] = r_id
            clean_restaurants.append(r)
            
    print(f"  Deduplicated restaurants: {len(restaurants)} -> {len(clean_restaurants)} (Removed {len(redirect_rest_ids)} duplicates)")
    
    # 2. Rewrite restaurante_ids in videos & plans using redirect_rest_ids
    for v in videos:
        r_id = v.get('restaurante_id')
        if r_id and r_id[1] in redirect_rest_ids:
            v['restaurante_id'] = ('string', redirect_rest_ids[r_id[1]])
            
    for p in plans:
        r_id = p.get('restaurante_id')
        if r_id and r_id[1] in redirect_rest_ids:
            p['restaurante_id'] = ('string', redirect_rest_ids[r_id[1]])
            
    # 3. Deduplicate videos by title and original URL, and then unique restaurant video
    seen_vid_urls = set()
    seen_vid_titles = set()
    seen_rest_vids = set() # Unique video per restaurant + influencer
    clean_videos = []
    
    for v in videos:
        title = v.get('titulo')
        url = v.get('url_original')
        rest_id = v.get('restaurante_id')
        infl_id = v.get('influencer_id')
        
        t_val = title[1] if title else ""
        u_val = url[1] if url else ""
        r_val = rest_id[1] if rest_id else ""
        i_val = infl_id[1] if infl_id else ""
        
        # Check if URL is mock or real
        is_mock_url = not (u_val and ("instagram.com/reel/" in u_val or "instagram.com/p/" in u_val) and len(u_val.split('/')[-2].split('?')[0]) == 11)
        
        is_duplicate = False
        if not is_mock_url:
            if u_val in seen_vid_urls:
                is_duplicate = True
            if t_val and t_val in seen_vid_titles:
                is_duplicate = True
                
        # Also prevent duplicate video for same restaurant and influencer
        if r_val and i_val:
            pair = (r_val, i_val)
            if pair in seen_rest_vids:
                is_duplicate = True
            else:
                if not is_duplicate:
                    seen_rest_vids.add(pair)
                    
        if not is_duplicate:
            if not is_mock_url:
                seen_vid_urls.add(u_val)
                if t_val:
                    seen_vid_titles.add(t_val)
            clean_videos.append(v)
            
    print(f"  Deduplicated videos: {len(videos)} -> {len(clean_videos)} (Removed {len(videos) - len(clean_videos)} duplicates)")
    
    # 4. Deduplicate plans by (restaurante_id, influencer_id)
    seen_plans = set()
    clean_plans = []
    
    for p in plans:
        rest_id = p.get('restaurante_id')
        infl_id = p.get('influencer_id')
        if rest_id and infl_id:
            pair = (rest_id[1], infl_id[1])
            if pair not in seen_plans:
                seen_plans.add(pair)
                clean_plans.append(p)
                
    print(f"  Deduplicated plans: {len(plans)} -> {len(clean_plans)} (Removed {len(plans) - len(clean_plans)} duplicates)")
    
    # 5. Overwrite cover photos of restaurants with local video thumbnails
    thumbnails_dir = "public/videos/thumbnails"
    updated_photos_count = 0
    
    for r in clean_restaurants:
        r_id = r['id'][1]
        
        # Find associated video in our cleaned videos list
        assoc_video = None
        for v in clean_videos:
            v_rest_id = v.get('restaurante_id')
            if v_rest_id and v_rest_id[1] == r_id:
                assoc_video = v
                break
                
        if assoc_video:
            v_title = assoc_video['titulo'][1]
            sanitized = sanitize_filename(v_title)
            
            # Check if thumb exists on disk
            thumb_path = os.path.join(thumbnails_dir, f"{sanitized}.jpg")
            if os.path.exists(thumb_path):
                thumb_url = f"/videos/thumbnails/{sanitized}.jpg"
                
                # Overwrite restaurant cover photo
                r['foto_capa_url'] = ('string', thumb_url)
                if 'thumbnail_url' in r:
                    r['thumbnail_url'] = ('string', thumb_url)
                
                # Overwrite video thumbnail_url
                assoc_video['thumbnail_url'] = ('string', thumb_url)
                
                updated_photos_count += 1
                
    print(f"  Updated cover photos for {updated_photos_count} restaurants to real video thumbnails.")
    
    # 6. Re-assemble and write back content
    # Format the lists
    new_infl_block = "const mockInfluencers = [\n" + ",\n".join(serialize_fields(x) for x in influencers) + "\n]"
    new_rest_block = "const mockRestaurantes = [\n" + ",\n".join(serialize_fields(x) for x in clean_restaurants) + "\n]"
    new_vid_block = "const mockVideos = [\n" + ",\n".join(serialize_fields(x) for x in clean_videos) + "\n]"
    new_plan_block = "const mockPlanos = [\n" + ",\n".join(serialize_fields(x) for x in clean_plans) + "\n]"
    
    # Construct the full file
    # We replace from idx_inf to the end of mockPlanos block
    prefix = content[:idx_inf]
    suffix = content[idx_plan_end:]
    
    new_content = prefix + new_infl_block + "\n\n" + new_rest_block + "\n\n" + new_vid_block + "\n\n" + new_plan_block + suffix
    
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(new_content)
        
    print(f"  [SUCCESS] Cleaned and updated {file_path}!")

def main():
    clean_file("lib/supabase-mock.ts")
    clean_file("app/api/videos/import/route.ts")

if __name__ == "__main__":
    main()

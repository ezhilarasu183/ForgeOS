import os

# ---------- CONFIG ----------
HF_TOKEN = os.environ.get("GROQ_API_KEY") # Renamed for consistency if needed, but kept the logic

client = Groq(
    api_key=HF_TOKEN
)

format_structure = {
  "ProjectName": "",
  "Purpose": "",
  "Scope": "",
  "Stakeholders": [],
  "FunctionalRequirements": [],
  "NonFunctionalRequirements": [],
  "Constraints": [],
  "AcceptanceCriteria": [],
  "UseCases": []
}

def understand_agent(user_input):
    prompt = """extract structured information from the request
    Important rules:
        - Do NOT assume missing information.
        - If something is not explicitly stated, return null.
        - Do NOT infer architecture or deployment.
        - Only extract what is clearly mentioned.
        return only valid JSON with these keys {
      "ProjectName",
      "Purpose",
      "Scope",
      "Stakeholders",
      "FunctionalRequirements",
      "NonFunctionalRequirements",
      "Constraints",
      "AcceptanceCriteria",
      "UseCases"
    }
    user prompt : """ + user_input
    response = client.chat.completions.create(
            model="qwen/qwen3-32b",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=2000,
            temperature=0.0,
        )
    raw_text = response.choices[0].message.content.strip()
    print(f"DEBUG: understand_agent raw output: {raw_text}") # Debug print

    start = raw_text.find("{")
    end = raw_text.rfind("}") + 1
    
    if start == -1 or end == 0:
        raise ValueError(f"No JSON found in response. Raw text: {raw_text}")

    json_text = raw_text[start:end]
    try:
        data = json.loads(json_text)
    except json.JSONDecodeError as e:
        print(f"JSON Decode Error: {e}")
        print(f"Faulty JSON text: {json_text}")
        raise e
    return data

def validation(data, format_dict):
    missing=[]
    for i in format_dict.keys():
        info=data.get(i)
        if info is None:
            missing.append(i)
            continue
    
    # In CLI mode, we ask for input. In library mode, this might be bypassed or handled differently.
    # For now, we keep the input() calls but this function is primarily for CLI.
    # If used in Streamlit, ensure 'data' is already complete before calling generating functions.
    for i in missing :
            user_val = input(f"please provide {i}:")
            data[i] = user_val.strip()
    if missing:
        print("missing fields  filled")
    return(data)

def generate_enhanced_content(final_data, format_template):
    # ---------- STRICT & OPTIMIZED PROMPT ----------
    prompt = f"""
You are a professional System Requirements Engineer.

Return ONLY valid JSON.

CRITICAL RULES:
- No markdown.
- No explanation.
- No comments.
- No nested objects.
- Output must be valid JSON only.
- Follow the exact structure shown below.
- Do not add extra keys.
- Do not remove keys.
- Do not rename keys.

STRUCTURE (follow exactly):

{json.dumps(format_template, indent=2)}

INPUT DATA (populate and enhance professionally without changing meaning):

{json.dumps(final_data, indent=2)}

CONTENT RULES:

1. Purpose:
   - Must be a professional paragraph.
   - Minimum 4 to 5 lines.
   - Clearly explain objective and business value.

2. Scope:
   - Must be a professional paragraph.
   - Minimum 4 to 5 lines.
   - Clearly define system boundaries and coverage.

3. All list fields must:
   - Be JSON arrays.
   - Contain at least 6 to 9 items.
   - Each item must be a complete sentence.
   - Each sentence must be concise and professional.
   - Do NOT return comma-separated text.
   - Do NOT return characters as separate items.
   - Do NOT return paragraphs in list fields.
   - no sub headings should be there in the text only points should be there in the list fields. if there are subheadings do not generate them and only generate the points in the list fields.

List fields:
- Stakeholders
- FunctionalRequirements
- NonFunctionalRequirements
- Constraints
- AcceptanceCriteria
- UseCases

3. All list fields must:
   - Be valid JSON arrays.
   - Contain at least 6 items.
   - Each item must be a single complete sentence.
   - No subheadings.
   - No grouped sections.
   - No nested objects.
   - No null values.
   - Only plain requirement sentences.
STRICT VALIDATION:
- No nested objects allowed.
- No null values.
- No empty arrays.
- No extra commentary.
- Output must be directly parseable by json.loads().
-dont give any empty output if there is a empty output regenerate the output
"""
    # ---------- API CALL WITH RETRY ----------
    data = None
    for attempt in range(3):
        try:
            response = client.chat.completions.create(
                model="qwen/qwen3-32b",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=2000,
                temperature=0.0,
            )

            raw_text = response.choices[0].message.content.strip()


            # Extract JSON safely
            start = raw_text.find("{")
            end = raw_text.rfind("}") + 1
            
            if start == -1 or end == 0:
                print(f"Warning: No JSON brackets found in attempt {attempt+1}")
                continue

            json_text = raw_text[start:end]
            
            try:
                data = json.loads(json_text)
                break
            except json.JSONDecodeError:
                print(f"Warning: Invalid JSON in attempt {attempt+1}")
                continue

        except Exception as e:
            print("JSON parse failed. Retrying...")
            if attempt == 2:
                print("Final failure. Raw response below:")
                # print(raw_text)
                raise e

    if data is None:
        raise Exception("Failed to generate valid JSON.")
    return data

def paragraphs(placeholder, value, doc):
    for p in doc.paragraphs:
        if placeholder in p.text:
            # Replace full paragraph text at once
            full_text = p.text.replace(placeholder, str(value))
            # Clear all runs
            for run in p.runs:
                run.text = ""
            # Add new single run
            run = p.add_run(full_text)
            run.font.name = "Roboto"
            run.font.size = Pt(12)
            if placeholder in ["{{PROJECT NAME}}", "{{PROJECTNAME}}"]:
                run.bold = True
            p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
            p.paragraph_format.first_line_indent = Pt(0)
            p.paragraph_format.left_indent = Pt(0)
            p.paragraph_format.right_indent = Pt(0)

def insert_bullets(placeholder, items, doc):
    for p in doc.paragraphs:
        if placeholder in p.text:
            p.text = p.text.replace(placeholder, "")
            parent = p._element.getparent()
            index = parent.index(p._element)

            for i, item in enumerate(items, start=1):
                new_p = doc.add_paragraph(f"{i}. {item}")
                new_p.paragraph_format.space_after = Pt(6)
                parent.insert(index + 1, new_p._element)
                index += 1

            break

def generate_srd_doc(data, version, author, output_filename="Final_SRD.docx"):
    # ---------- LOAD TEMPLATE ----------
    doc1 = Document("srd_template.docx")
    
    tday_srd = date.today()
    input_field_srd = {
        "{{VERSION}}": version,
        "{{DATE}}": tday_srd,
        "{{AUTHOR}}": author
    }
    for placeholder, key in input_field_srd.items():
        paragraphs(placeholder, key, doc1)
        
    paragraph_fields = {
        "{{PROJECT NAME}}": "ProjectName",
        "{{PURPOSE}}": "Purpose",
        "{{SCOPE}}": "Scope",
    }
    for placeholder, key in paragraph_fields.items():
        paragraphs(placeholder, data[key], doc1)
        
    bullet_fields = {
        "{{STAKEHOLDERS}}": "Stakeholders",
        "{{HIGH-LEVEL SYSTEM REQUIREMENTS (FUNCTIONAL)}}": "FunctionalRequirements",
        "{{NON-FUNCTIONAL REQUIREMENTS}}": "NonFunctionalRequirements",
        "{{CONSTRAINTS}}": "Constraints",
        "{{ACCEPTANCE CRITERIA}}": "AcceptanceCriteria",
        "{{USECASE}}": "UseCases"
    }
    for placeholder, key in bullet_fields.items():
        insert_bullets(placeholder, data[key], doc1)

    # ---------- SAVE ----------
    doc1.save(output_filename)
    print("SRD generated successfully!")


def ssd_json(data, bom):
    format_spec = {
        "ProjectName": "",
        "Purpose": "",
        "Scope": "",
        "SystemArchitecture": [],
        "HardwareComponentSpecification": [],
        "SoftwareStack": [],
        "Interfaces": [],
        "ElectricalMechanicalIntegration": [],
        "SafetyFailover": [],
        "Constraints": []
    }

    prompt = f"""
You are a senior System Architect.

Return ONLY valid JSON.

CRITICAL RULES:
- No markdown.
- No explanation.
- No comments.
- No nested objects.
- Follow the exact JSON structure shown below.
- Do not add extra keys.
- Do not rename keys.
- Use ONLY information explicitly present in SRD and BOM.
- Do NOT invent hardware not in BOM.
- Do NOT introduce new numeric values.
- If something is not present in SRD or BOM, do NOT generate it.

STRUCTURE (follow exactly):

{json.dumps(format_spec, indent=2)}

INPUT SRD:
{json.dumps(data, indent=2)}

INPUT BOM:
{bom}

CONTENT RULES:

1. Purpose:
   - Reuse SRD Purpose.
   - Do not modify meaning.

2. Scope:
   -GIVE BOTH HARDWARE AND SOFTWARE SCOPE.
   - Do not add new boundaries.

3. All list fields:
   - Must be arrays.
   - Minimum 6 to 9 items.
   - Each item must be a complete sentence.

4. Constraints:
   - Must strictly match SRD constraints.
   - Do NOT add new limits.

STRICT VALIDATION:
- No null.
- No empty arrays.
- Output must be directly parseable using json.loads().
""" 

    ssd_data = None
    for attempt in range(3):
        response = client.chat.completions.create(
            model="qwen/qwen3-32b",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=2000,
            temperature=0.0,
            )

        ssd_data = response.choices[0].message.content.strip()
        print(f"DEBUG: ssd_json raw output (Attempt {attempt+1}): {ssd_data[:100]}...")
        
        start = ssd_data.find("{")
        end = ssd_data.rfind("}") + 1
        
        if start == -1 or end == 0:
             print(f"Warning: No JSON found in SSD response attempt {attempt+1}")
             continue
             
        json_text = ssd_data[start:end]
        try:
            ssd_data = json.loads(json_text)
            return ssd_data
        except json.JSONDecodeError:
             print(f"Warning: Invalid JSON in SSD response attempt {attempt+1}")
             continue

def generate_ssd_doc(ssd_data, version, author, output_filename="Final_SSD.docx"):
    bullet_fields_ssd = {
        "{{SYSTEMARCHITECTURE}}": "SystemArchitecture",
        "{{HARDWARECOMPONENTSPECIFICATION}}": "HardwareComponentSpecification",
        "{{SOFTWARESTACK}}": "SoftwareStack",
        "{{CONSTRAINTS}}": "Constraints",
        "{{INTERFACES}}": "Interfaces",
        "{{SAFETY&FAILOVER}}": "SafetyFailover",
        "{{ELECTRICAL & MECHANICAL INTEGRATION NOTES}}": "ElectricalMechanicalIntegration"
    }
    
    doc2 = Document("ssd_template.docx")
    tday_ssd = date.today()
    
    paragraph_fields_ssd = {
            "{{PROJECTNAME}}": "ProjectName",
            "{{PURPOSE1}}": "Purpose",
            "{{SCOPE1}}": "Scope",
        }
    input_field_ssd = {
        "{{VERSION}}": version,
        "{{DATE}}": tday_ssd,
        "{{AUTHOR}}": author
    }

    for placeholder, key in paragraph_fields_ssd.items():
        paragraphs(placeholder, ssd_data[key], doc2)
    for placeholder, key in input_field_ssd.items():
        paragraphs(placeholder, key, doc2)
    for placeholder, key in bullet_fields_ssd.items():
        insert_bullets(placeholder, ssd_data[key], doc2)   
    doc2.save(output_filename)
    print("SSD generated Successsfully")

def main():
    user = input()
    data = understand_agent(user)
    final_data = validation(data, format_structure)
    
    # Enrich content
    enhanced_data = generate_enhanced_content(final_data, format_structure)
    
    ver_srd = float(input("enter the version number of the document"))
    auth_srd = input("enter the author name")
    
    generate_srd_doc(enhanced_data, ver_srd, auth_srd)
    
    ssd = input("Do you want me to generate SSD (Yes or No)")
    if ssd.lower().startswith('y'):
        bom = input("Paste the BOM of the project")
        ssd_data = ssd_json(enhanced_data, bom)
        
        ver_ssd = float(input("enter the version number of the document"))
        auth_ssd = input("enter the author name")
        
        generate_ssd_doc(ssd_data, ver_ssd, auth_ssd)

if __name__ == "__main__":
    main()

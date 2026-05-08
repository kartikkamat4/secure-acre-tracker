from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware

from sqlalchemy.orm import Session

from database import engine, Base, get_db

from models import LandRecord, AuditLog

from audit_logger import create_audit_log

from verifier import verify_chain


app = FastAPI()


# -----------------------------------
# CORS
# -----------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -----------------------------------
# Create Tables
# -----------------------------------
Base.metadata.create_all(bind=engine)


# -----------------------------------
# Home
# -----------------------------------
@app.get("/")
def home():

    return {
        "message": "AgriShield Backend Running"
    }


# -----------------------------------
# Create Record
# -----------------------------------
@app.post("/create-record")
def create_record(

    owner_name: str,
    survey_number: str,
    village: str,
    district: str,
    crop_type: str,
    area: str,
    status: str,

    db: Session = Depends(get_db)
):

    record = LandRecord(

        owner_name=owner_name,

        survey_number=survey_number,

        district=district,

        village=village,

        crop_type=crop_type,

        area=area,

        status=status,

        integrity="true"
    )

    db.add(record)

    db.commit()

    db.refresh(record)

    return {
        "message": "Record Created"
    }


# -----------------------------------
# Get Records
# -----------------------------------
@app.get("/records")
def get_records(
    db: Session = Depends(get_db)
):

    records = db.query(LandRecord).all()

    result = []

    for r in records:

        result.append({

            "id": r.id,

            "survey": r.survey_number,

            "owner": r.owner_name,

            "district": r.district,

            "village": r.village,

            "crop": r.crop_type,

            "area": r.area,

            "status": r.status,

            "integrity": (
                False
                if r.integrity == "false"
                else True
            )
        })

    return result


# -----------------------------------
# Update Ownership
# -----------------------------------
@app.post("/update-record")
def update_record(

    record_id: int,
    new_owner: str,

    db: Session = Depends(get_db)
):

    record = (
        db.query(LandRecord)
        .filter(LandRecord.id == record_id)
        .first()
    )

    if not record:

        return {
            "error": "Record not found"
        }

    old_owner = record.owner_name

    record.owner_name = new_owner

    db.commit()

    create_audit_log(

        db=db,

        user_id="OFFICER_01",

        action_type="TRANSFER_OWNERSHIP",

        record_id=str(record.id),

        old_data=old_owner,

        new_data=new_owner
    )

    return {
        "message": "Ownership Updated"
    }


# -----------------------------------
# Get Logs
# -----------------------------------
@app.get("/logs")
def get_logs(
    db: Session = Depends(get_db)
):

    logs = db.query(AuditLog).all()

    result = []

    for log in logs:

        result.append({

            "id": log.id,

            "user_id": log.user_id,

            "action_type": log.action_type,

            "record_id": log.record_id,

            "old_data": log.old_data,

            "new_data": log.new_data,

            "previous_hash": log.previous_hash,

            "current_hash": log.current_hash
        })

    return result


# -----------------------------------
# Verify Chain
# -----------------------------------
@app.get("/verify-chain")
def verify(
    db: Session = Depends(get_db)
):

    result = verify_chain(db)

    return result
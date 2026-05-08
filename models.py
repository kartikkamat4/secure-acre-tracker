from sqlalchemy import Column, Integer, String, Text

from database import Base


# ---------------------------------
# LAND RECORD TABLE
# ---------------------------------
class LandRecord(Base):

    __tablename__ = "land_records"

    id = Column(Integer, primary_key=True, index=True)

    owner_name = Column(String)

    survey_number = Column(String)

    district = Column(String)

    village = Column(String)

    crop_type = Column(String)

    area = Column(String)

    status = Column(String)

    integrity = Column(String)

# ---------------------------------
# AUDIT LOG TABLE
# ---------------------------------
class AuditLog(Base):

    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(String)

    action_type = Column(String)

    record_id = Column(String)

    old_data = Column(Text)

    new_data = Column(Text)

    previous_hash = Column(Text)

    current_hash = Column(Text)
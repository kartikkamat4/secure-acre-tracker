from sqlalchemy.orm import Session

from models import AuditLog

from hash_utils import generate_hash


def create_audit_log(
    db: Session,
    user_id: str,
    action_type: str,
    record_id: str,
    old_data: str,
    new_data: str
):

    # Get latest log
    previous_log = (
        db.query(AuditLog)
        .order_by(AuditLog.id.desc())
        .first()
    )

    # Previous hash
    previous_hash = (
        previous_log.current_hash
        if previous_log
        else "GENESIS"
    )

    # Create hash data
    hash_data = (
        str(user_id) +
        str(action_type) +
        str(record_id) +
        str(old_data) +
        str(new_data) +
        str(previous_hash)
    )

    # Generate current hash
    current_hash = generate_hash(hash_data)

    # Create log
    log = AuditLog(
        user_id=user_id,
        action_type=action_type,
        record_id=record_id,
        old_data=old_data,
        new_data=new_data,
        previous_hash=previous_hash,
        current_hash=current_hash
    )

    db.add(log)

    db.commit()

    db.refresh(log)

    return log
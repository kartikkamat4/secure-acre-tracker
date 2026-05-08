from models import AuditLog

from hash_utils import generate_hash


def verify_chain(db):

    logs = db.query(AuditLog).order_by(AuditLog.id).all()

    for i in range(len(logs)):

        log = logs[i]

        # Recalculate hash
        hash_data = (
            str(log.user_id) +
            str(log.action_type) +
            str(log.record_id) +
            str(log.old_data) +
            str(log.new_data) +
            str(log.previous_hash)
        )

        recalculated_hash = generate_hash(hash_data)

        # Check hash integrity
        if recalculated_hash != log.current_hash:

            return {
                "status": "TAMPERING DETECTED",
                "log_id": log.id
            }

        # Check chain linkage
        if i > 0:

            previous_log = logs[i - 1]

            if log.previous_hash != previous_log.current_hash:

                return {
                    "status": "CHAIN BROKEN",
                    "log_id": log.id
                }

    return {
        "status": "CHAIN VERIFIED"
    }
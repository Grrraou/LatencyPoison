from database import SessionLocal, User, Base, engine
from passlib.context import CryptContext
import os

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def init_db():
    # Create database directory if it doesn't exist
    os.makedirs("/data", exist_ok=True)
    
    # Create all tables
    Base.metadata.create_all(bind=engine)
    
    # Create a session
    db = SessionLocal()
    
    try:
        # Check if demo user already exists
        demo_user = db.query(User).filter(User.username == "demo").first()
        if not demo_user:
            # Create demo user
            demo_user = User(
                username="demo",
                email="demo@example.com",
                full_name="Demo User",
                hashed_password=pwd_context.hash("demo123"),
                disabled=False
            )
            db.add(demo_user)
            db.commit()
            print("Demo user created successfully")
            print("Username: demo")
            print("Password: demo123")
        else:
            print("Demo user already exists")
    except Exception as e:
        print(f"Error creating demo user: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    init_db() 
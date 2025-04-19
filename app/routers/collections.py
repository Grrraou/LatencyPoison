from fastapi import APIRouter, HTTPException, Depends
from ..core.security import get_current_user
from ..schemas.collection import Collection, CollectionCreate, CollectionUpdate
from ..schemas.user import TokenData
import uuid
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/collections", tags=["collections"])

# In-memory storage for collections (replace with database in production)
collections = {}

@router.post("/", response_model=Collection)
async def create_collection(
    collection: CollectionCreate,
    current_user: TokenData = Depends(get_current_user)
):
    try:
        logger.info(f"Creating collection for user: {current_user.email}")
        collection_id = str(uuid.uuid4())
        new_collection = Collection(
            id=collection_id,
            name=collection.name,
            base_url=collection.base_url,
            default_latency_ms=collection.default_latency_ms,
            default_fail_rate=collection.default_fail_rate,
            user_email=current_user.email,
            endpoints=[]
        )
        collections[collection_id] = new_collection
        return new_collection
    except Exception as e:
        logger.error(f"Error creating collection: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/", response_model=list[Collection])
async def get_collections(current_user: TokenData = Depends(get_current_user)):
    try:
        logger.info(f"Getting collections for user: {current_user.email}")
        user_collections = [
            collection for collection in collections.values()
            if collection.user_email == current_user.email
        ]
        return user_collections
    except Exception as e:
        logger.error(f"Error getting collections: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{collection_id}", response_model=Collection)
async def get_collection(
    collection_id: str,
    current_user: TokenData = Depends(get_current_user)
):
    try:
        logger.info(f"Getting collection {collection_id} for user: {current_user.email}")
        collection = collections.get(collection_id)
        if not collection:
            raise HTTPException(status_code=404, detail="Collection not found")
        if collection.user_email != current_user.email:
            raise HTTPException(status_code=403, detail="Not authorized to access this collection")
        return collection
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting collection: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{collection_id}", response_model=Collection)
async def update_collection(
    collection_id: str,
    collection_update: CollectionUpdate,
    current_user: TokenData = Depends(get_current_user)
):
    try:
        logger.info(f"Updating collection {collection_id} for user: {current_user.email}")
        collection = collections.get(collection_id)
        if not collection:
            raise HTTPException(status_code=404, detail="Collection not found")
        if collection.user_email != current_user.email:
            raise HTTPException(status_code=403, detail="Not authorized to update this collection")
        
        if collection_update.name is not None:
            collection.name = collection_update.name
        
        collections[collection_id] = collection
        return collection
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating collection: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{collection_id}")
async def delete_collection(
    collection_id: str,
    current_user: TokenData = Depends(get_current_user)
):
    try:
        logger.info(f"Deleting collection {collection_id} for user: {current_user.email}")
        collection = collections.get(collection_id)
        if not collection:
            raise HTTPException(status_code=404, detail="Collection not found")
        if collection.user_email != current_user.email:
            raise HTTPException(status_code=403, detail="Not authorized to delete this collection")
        
        del collections[collection_id]
        return {"message": "Collection deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting collection: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e)) 
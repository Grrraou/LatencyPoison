from fastapi import APIRouter, HTTPException, Depends
from ..core.security import get_current_user
from ..schemas.endpoint import Endpoint, EndpointCreate, EndpointUpdate
from ..schemas.user import TokenData
import uuid
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/endpoints", tags=["endpoints"])

# In-memory storage for endpoints (replace with database in production)
endpoints = {}

@router.post("/", response_model=Endpoint)
async def create_endpoint(
    endpoint: EndpointCreate,
    collection_id: str,
    current_user: TokenData = Depends(get_current_user)
):
    try:
        logger.info(f"Creating endpoint for collection: {collection_id}")
        endpoint_id = str(uuid.uuid4())
        new_endpoint = Endpoint(
            id=endpoint_id,
            url=endpoint.url,
            latency_ms=endpoint.latency_ms,
            fail_rate=endpoint.fail_rate,
            collection_id=collection_id
        )
        endpoints[endpoint_id] = new_endpoint
        return new_endpoint
    except Exception as e:
        logger.error(f"Error creating endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/collection/{collection_id}", response_model=list[Endpoint])
async def get_collection_endpoints(
    collection_id: str,
    current_user: TokenData = Depends(get_current_user)
):
    try:
        logger.info(f"Getting endpoints for collection: {collection_id}")
        collection_endpoints = [
            endpoint for endpoint in endpoints.values()
            if endpoint.collection_id == collection_id
        ]
        return collection_endpoints
    except Exception as e:
        logger.error(f"Error getting endpoints: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{endpoint_id}", response_model=Endpoint)
async def get_endpoint(
    endpoint_id: str,
    current_user: TokenData = Depends(get_current_user)
):
    try:
        logger.info(f"Getting endpoint: {endpoint_id}")
        endpoint = endpoints.get(endpoint_id)
        if not endpoint:
            raise HTTPException(status_code=404, detail="Endpoint not found")
        return endpoint
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{endpoint_id}", response_model=Endpoint)
async def update_endpoint(
    endpoint_id: str,
    endpoint_update: EndpointUpdate,
    current_user: TokenData = Depends(get_current_user)
):
    try:
        logger.info(f"Updating endpoint: {endpoint_id}")
        endpoint = endpoints.get(endpoint_id)
        if not endpoint:
            raise HTTPException(status_code=404, detail="Endpoint not found")
        
        if endpoint_update.url is not None:
            endpoint.url = endpoint_update.url
        if endpoint_update.latency_ms is not None:
            endpoint.latency_ms = endpoint_update.latency_ms
        if endpoint_update.fail_rate is not None:
            endpoint.fail_rate = endpoint_update.fail_rate
        
        endpoints[endpoint_id] = endpoint
        return endpoint
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{endpoint_id}")
async def delete_endpoint(
    endpoint_id: str,
    current_user: TokenData = Depends(get_current_user)
):
    try:
        logger.info(f"Deleting endpoint: {endpoint_id}")
        endpoint = endpoints.get(endpoint_id)
        if not endpoint:
            raise HTTPException(status_code=404, detail="Endpoint not found")
        
        del endpoints[endpoint_id]
        return {"message": "Endpoint deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e)) 
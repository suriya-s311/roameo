"""
ROAMEO Backend Dependencies — Auth & Supabase client injection
"""
from fastapi import Depends, HTTPException, Header, status
from supabase import create_client, Client
from jose import jwt, JWTError
from app.config import settings


def get_supabase() -> Client:
    """Get Supabase admin client (service role)."""
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)


async def get_current_user(authorization: str = Header(..., alias="Authorization")):
    """
    Validate the Supabase JWT from the Authorization header.
    Returns the decoded payload with user_id and role.
    """
    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header format",
        )

    token = authorization.replace("Bearer ", "")

    try:
        # Verify using Supabase JWT secret
        payload = jwt.decode(
            token,
            settings.SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            audience="authenticated",
        )
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: no user ID",
            )

        # Fetch role from profiles table
        supabase = get_supabase()
        profile_resp = (
            supabase.table("profiles")
            .select("role")
            .eq("id", user_id)
            .maybe_single()
            .execute()
        )
        role = profile_resp.data.get("role", "traveler") if profile_resp.data else "traveler"

        return {"user_id": user_id, "email": payload.get("email", ""), "role": role}

    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )


async def require_seller(current_user: dict = Depends(get_current_user)):
    """Require the current user to have the seller role."""
    if current_user.get("role") != "seller":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Seller access required",
        )
    return current_user


async def require_traveler(current_user: dict = Depends(get_current_user)):
    """Require the current user to have the traveler role."""
    if current_user.get("role") != "traveler":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Traveler access required",
        )
    return current_user

"""
Authentication module for JWT token verification and user extraction.

Supports both:
- RS256 with JWKS (recommended) - uses public key from Supabase JWKS endpoint
- HS256 with JWT secret (legacy fallback)
"""
import jwt
from jwt import PyJWKClient
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Dict, Optional

from app.config import settings

# Security scheme for FastAPI
security = HTTPBearer()

# JWKS client for RS256 verification (cached)
_jwks_client: Optional[PyJWKClient] = None


def _get_jwks_client() -> Optional[PyJWKClient]:
    """Get or create the JWKS client for RS256 verification."""
    global _jwks_client
    if _jwks_client is None and settings.SUPABASE_JWKS_URL:
        _jwks_client = PyJWKClient(settings.SUPABASE_JWKS_URL, cache_keys=True)
    return _jwks_client


def verify_jwt_token(token: str) -> Dict:
    """
    Verify and decode a Supabase JWT token.

    Uses RS256 with JWKS if SUPABASE_JWKS_URL is configured (recommended),
    otherwise falls back to HS256 with SUPABASE_JWT_SECRET (legacy).

    Args:
        token: The JWT token string to verify

    Returns:
        Dict containing the decoded token payload

    Raises:
        HTTPException: If token is invalid or expired
    """
    try:
        jwks_client = _get_jwks_client()

        if jwks_client:
            # RS256 verification using JWKS (recommended)
            signing_key = jwks_client.get_signing_key_from_jwt(token)
            payload = jwt.decode(
                token,
                signing_key.key,
                algorithms=["RS256"],
                audience="authenticated"
            )
        elif settings.SUPABASE_JWT_SECRET:
            # Legacy HS256 fallback
            payload = jwt.decode(
                token,
                settings.SUPABASE_JWT_SECRET,
                algorithms=["HS256"],
                audience="authenticated"
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="JWT verification not configured. Set SUPABASE_JWKS_URL or SUPABASE_JWT_SECRET.",
            )

        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.InvalidTokenError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid authentication token: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Could not validate credentials: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> Dict:
    """
    FastAPI dependency to extract and verify the current user from JWT token.

    Usage:
        @app.get("/protected")
        async def protected_route(current_user: dict = Depends(get_current_user)):
            user_id = current_user["sub"]
            return {"user_id": user_id}

    Args:
        credentials: HTTP Bearer credentials from Authorization header

    Returns:
        Dict containing user information from JWT payload:
            - sub: User ID (UUID)
            - email: User email
            - role: User role (if present in app_metadata)
            - aud: Audience
            - exp: Expiration timestamp

    Raises:
        HTTPException: If token is missing, invalid, or expired
    """
    token = credentials.credentials
    payload = verify_jwt_token(token)
    return payload


def get_current_user_id(current_user: Dict = Depends(get_current_user)) -> str:
    """
    FastAPI dependency to extract just the user ID.

    Usage:
        @app.get("/goals")
        async def get_goals(user_id: str = Depends(get_current_user_id)):
            return {"user_id": user_id}

    Args:
        current_user: The current user dict from get_current_user

    Returns:
        str: The user's UUID as a string
    """
    return current_user["sub"]


def get_current_user_email(current_user: Dict = Depends(get_current_user)) -> str:
    """
    FastAPI dependency to extract the user's email.

    Usage:
        @app.post("/invitations/{id}/accept")
        async def accept_invitation(
            user_email: str = Depends(get_current_user_email)
        ):
            return {"email": user_email}

    Args:
        current_user: The current user dict from get_current_user

    Returns:
        str: The user's email address
    """
    return current_user["email"]


def get_user_role(current_user: Dict = Depends(get_current_user)) -> Optional[str]:
    """
    Extract the user's role from JWT token metadata.

    Args:
        current_user: The current user dict from get_current_user

    Returns:
        Optional[str]: The user's role (e.g., "admin", "user") or None
    """
    # Supabase stores custom metadata in app_metadata or user_metadata
    app_metadata = current_user.get("app_metadata", {})
    return app_metadata.get("role")


def require_role(required_role: str):
    """
    Dependency factory to require a specific role.

    Usage:
        @app.delete("/admin/goals/{goal_id}")
        async def admin_delete_goal(
            goal_id: int,
            current_user: dict = Depends(require_role("admin"))
        ):
            # Only admins can access this endpoint
            pass

    Args:
        required_role: The role required to access the endpoint

    Returns:
        A FastAPI dependency function
    """
    def role_checker(current_user: Dict = Depends(get_current_user)) -> Dict:
        user_role = get_user_role(current_user)
        if user_role != required_role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Insufficient permissions. Required role: {required_role}",
            )
        return current_user
    return role_checker


# Optional: Create an admin-only dependency
require_admin = require_role("admin")

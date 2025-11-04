from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from . import schemas, models
from typing import List, Optional


async def get_goals(db: AsyncSession) -> List[schemas.Goal]:
    result = await db.execute(select(schemas.Goal).order_by(schemas.Goal.created_at.desc()))
    return result.scalars().all()


async def get_goal(db: AsyncSession, goal_id: int) -> Optional[schemas.Goal]:
    result = await db.execute(select(schemas.Goal).filter(schemas.Goal.id == goal_id))
    return result.scalar_one_or_none()


async def create_goal(db: AsyncSession, goal: models.GoalCreate) -> schemas.Goal:
    db_goal = schemas.Goal(
        title=goal.title,
        description=goal.description,
        status=goal.status,
        target_date=goal.target_date
    )
    db.add(db_goal)
    await db.commit()
    await db.refresh(db_goal)
    return db_goal


async def update_goal(
    db: AsyncSession,
    goal_id: int,
    goal: models.GoalUpdate
) -> Optional[schemas.Goal]:
    result = await db.execute(select(schemas.Goal).filter(schemas.Goal.id == goal_id))
    db_goal = result.scalar_one_or_none()

    if db_goal is None:
        return None

    update_data = goal.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_goal, field, value)

    await db.commit()
    await db.refresh(db_goal)
    return db_goal


async def delete_goal(db: AsyncSession, goal_id: int) -> bool:
    result = await db.execute(select(schemas.Goal).filter(schemas.Goal.id == goal_id))
    db_goal = result.scalar_one_or_none()

    if db_goal is None:
        return False

    await db.delete(db_goal)
    await db.commit()
    return True

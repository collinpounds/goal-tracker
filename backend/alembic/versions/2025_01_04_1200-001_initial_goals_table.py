"""initial goals table

Revision ID: 001
Revises:
Create Date: 2025-01-04 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '001'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create goals table
    op.create_table(
        'goals',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(length=200), nullable=False),
        sa.Column('description', sa.String(), nullable=True),
        sa.Column(
            'status',
            sa.Enum('PENDING', 'IN_PROGRESS', 'COMPLETED', name='goalstatus'),
            nullable=False,
            server_default='PENDING'
        ),
        sa.Column('target_date', sa.DateTime(timezone=True), nullable=True),
        sa.Column(
            'created_at',
            sa.DateTime(timezone=True),
            server_default=sa.text('now()'),
            nullable=False
        ),
        sa.PrimaryKeyConstraint('id')
    )

    # Create indexes
    op.create_index(op.f('ix_goals_id'), 'goals', ['id'], unique=False)


def downgrade() -> None:
    # Drop indexes
    op.drop_index(op.f('ix_goals_id'), table_name='goals')

    # Drop table
    op.drop_table('goals')

    # Drop enum type
    op.execute('DROP TYPE goalstatus')

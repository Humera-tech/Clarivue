
"""add document activity log

Revision ID: 90a785e84272
Revises: 8932480d020d
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "90a785e84272"
down_revision: Union[str, None] = "8932480d020d"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "document_activities",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column(
            "user_id",
            sa.Integer(),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "document_id",
            sa.Integer(),
            sa.ForeignKey("documents.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column("action", sa.String(50), nullable=False),
        sa.Column("details", sa.String(500), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
    )

    op.create_index(
        "ix_document_activities_user_id",
        "document_activities",
        ["user_id"],
    )
    op.create_index(
        "ix_document_activities_document_id",
        "document_activities",
        ["document_id"],
    )


def downgrade() -> None:
    op.drop_index(
        "ix_document_activities_document_id",
        table_name="document_activities",
    )
    op.drop_index(
        "ix_document_activities_user_id",
        table_name="document_activities",
    )
    op.drop_table("document_activities")

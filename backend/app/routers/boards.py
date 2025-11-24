from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session, joinedload
from typing import List
from sqlalchemy import and_

from app.database import get_db
from app.models import Board, BoardColumn, BoardCard, Contact, User, Task, Document, task_contact_association
from app.routers.auth import get_current_user
from datetime import datetime, timezone
from sqlalchemy import func
from app.schemas.board_schemas import (
    BoardCreate,
    BoardUpdate,
    BoardResponse,
    BoardDetailResponse,
    BoardColumnCreate,
    BoardColumnUpdate,
    BoardColumnResponse,
    BoardCardCreate,
    BoardCardUpdate,
    BoardCardResponse,
    ContactSummary
)

router = APIRouter(tags=["boards"])

@router.get("/", response_model=List[BoardResponse])
async def list_boards(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all boards for the current user"""
    boards = (
        db.query(Board)
        .filter(Board.created_by_id == current_user.id)
        .options(joinedload(Board.columns))
        .order_by(Board.created_at.desc())
        .all()
    )
    
    result = []
    for board in boards:
        columns = [
            BoardColumnResponse(
                id=col.id,
                board_id=col.board_id,
                name=col.name,
                position=col.position,
                color=col.color,
                wip_limit=col.wip_limit,
                created_at=col.created_at,
                updated_at=col.updated_at
            )
            for col in sorted(board.columns, key=lambda x: x.position)
        ]
        
        result.append(BoardResponse(
            id=board.id,
            name=board.name,
            description=board.description,
            color=board.color,
            created_by_id=board.created_by_id,
            columns=columns,
            created_at=board.created_at,
            updated_at=board.updated_at
        ))
    
    return result

@router.post("/", response_model=BoardResponse)
async def create_board(
    board_data: BoardCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new board"""
    board = Board(
        name=board_data.name,
        description=board_data.description,
        color=board_data.color or "#1E40AF",
        created_by_id=current_user.id
    )
    
    db.add(board)
    db.flush()
    
    # Create initial columns if provided
    if board_data.columns:
        for idx, col_data in enumerate(board_data.columns):
            column = BoardColumn(
                board_id=board.id,
                name=col_data.name,
                position=col_data.position if col_data.position is not None else idx,
                color=col_data.color,
                wip_limit=col_data.wip_limit
            )
            db.add(column)
    
    db.commit()
    db.refresh(board)
    
    # Load columns for response
    board = (
        db.query(Board)
        .filter(Board.id == board.id)
        .options(joinedload(Board.columns))
        .first()
    )
    
    columns = [
        BoardColumnResponse(
            id=col.id,
            board_id=col.board_id,
            name=col.name,
            position=col.position,
            color=col.color,
            wip_limit=col.wip_limit,
            created_at=col.created_at,
            updated_at=col.updated_at
        )
        for col in sorted(board.columns, key=lambda x: x.position)
    ]
    
    return BoardResponse(
        id=board.id,
        name=board.name,
        description=board.description,
        color=board.color,
        created_by_id=board.created_by_id,
        columns=columns,
        created_at=board.created_at,
        updated_at=board.updated_at
    )

@router.get("/{board_id}", response_model=BoardDetailResponse)
async def get_board(
    board_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a board with all columns and cards"""
    board = (
        db.query(Board)
        .filter(
            Board.id == board_id,
            Board.created_by_id == current_user.id
        )
        .options(
            joinedload(Board.columns).joinedload(BoardColumn.cards).joinedload(BoardCard.contact)
        )
        .first()
    )
    
    if not board:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Board not found"
        )
    
    columns = []
    for col in sorted(board.columns, key=lambda x: x.position):
        cards = []
        for card in sorted(col.cards, key=lambda x: x.position):
            contact = card.contact
            
            # Calculate days in status (from when card was created/moved to this column)
            days_in_status = None
            if card.created_at:
                now = datetime.now(timezone.utc)
                if card.created_at.tzinfo is None:
                    # Handle naive datetime
                    card_date = card.created_at.replace(tzinfo=timezone.utc)
                else:
                    card_date = card.created_at
                delta = now - card_date
                days_in_status = delta.days
            
            # Count tasks for this contact (via many-to-many relationship)
            task_count = db.query(func.count(Task.id)).join(
                task_contact_association,
                Task.id == task_contact_association.c.task_id
            ).filter(
                task_contact_association.c.contact_id == contact.id,
                Task.created_by_id == current_user.id
            ).scalar() or 0
            
            # Count documents for this contact
            document_count = db.query(func.count(Document.id)).filter(
                Document.contact_id == contact.id,
                Document.created_by_id == current_user.id
            ).scalar() or 0
            
            cards.append(BoardCardResponse(
                id=card.id,
                board_column_id=card.board_column_id,
                contact_id=card.contact_id,
                position=card.position,
                notes=card.notes,
                contact=ContactSummary(
                    id=contact.id,
                    display_name=contact.display_name,
                    full_name=contact.full_name,
                    email=contact.email,
                    company=contact.company,
                    contact_type=contact.contact_type,
                    status=contact.status,
                    sales_rep_name=None  # Can be populated if needed
                ),
                created_by_id=card.created_by_id,
                created_at=card.created_at,
                updated_at=card.updated_at,
                days_in_status=days_in_status,
                task_count=task_count,
                document_count=document_count
            ))
        
        columns.append(BoardColumnResponse(
            id=col.id,
            board_id=col.board_id,
            name=col.name,
            position=col.position,
            color=col.color,
            wip_limit=col.wip_limit,
            created_at=col.created_at,
            updated_at=col.updated_at,
            cards=cards
        ))
    
    return BoardDetailResponse(
        id=board.id,
        name=board.name,
        description=board.description,
        color=board.color,
        created_by_id=board.created_by_id,
        columns=columns,
        created_at=board.created_at,
        updated_at=board.updated_at
    )

@router.put("/{board_id}", response_model=BoardResponse)
async def update_board(
    board_id: int,
    board_data: BoardUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a board"""
    board = db.query(Board).filter(
        Board.id == board_id,
        Board.created_by_id == current_user.id
    ).first()
    
    if not board:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Board not found"
        )
    
    if board_data.name is not None:
        board.name = board_data.name
    if board_data.description is not None:
        board.description = board_data.description
    if board_data.color is not None:
        board.color = board_data.color
    
    db.commit()
    db.refresh(board)
    
    # Load columns for response
    board = (
        db.query(Board)
        .filter(Board.id == board.id)
        .options(joinedload(Board.columns))
        .first()
    )
    
    columns = [
        BoardColumnResponse(
            id=col.id,
            board_id=col.board_id,
            name=col.name,
            position=col.position,
            color=col.color,
            wip_limit=col.wip_limit,
            created_at=col.created_at,
            updated_at=col.updated_at
        )
        for col in sorted(board.columns, key=lambda x: x.position)
    ]
    
    return BoardResponse(
        id=board.id,
        name=board.name,
        description=board.description,
        color=board.color,
        created_by_id=board.created_by_id,
        columns=columns,
        created_at=board.created_at,
        updated_at=board.updated_at
    )

@router.delete("/{board_id}")
async def delete_board(
    board_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a board"""
    board = db.query(Board).filter(
        Board.id == board_id,
        Board.created_by_id == current_user.id
    ).first()
    
    if not board:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Board not found"
        )
    
    db.delete(board)
    db.commit()
    
    return {"message": "Board deleted successfully"}

# Column endpoints
@router.post("/{board_id}/columns", response_model=BoardColumnResponse)
async def create_column(
    board_id: int,
    column_data: BoardColumnCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new column in a board"""
    board = db.query(Board).filter(
        Board.id == board_id,
        Board.created_by_id == current_user.id
    ).first()
    
    if not board:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Board not found"
        )
    
    column = BoardColumn(
        board_id=board_id,
        name=column_data.name,
        position=column_data.position,
        color=column_data.color,
        wip_limit=column_data.wip_limit
    )
    
    db.add(column)
    db.commit()
    db.refresh(column)
    
    return BoardColumnResponse(
        id=column.id,
        board_id=column.board_id,
        name=column.name,
        position=column.position,
        color=column.color,
        wip_limit=column.wip_limit,
        created_at=column.created_at,
        updated_at=column.updated_at
    )

@router.put("/columns/{column_id}", response_model=BoardColumnResponse)
async def update_column(
    column_id: int,
    column_data: BoardColumnUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a column"""
    column = (
        db.query(BoardColumn)
        .join(Board)
        .filter(
            BoardColumn.id == column_id,
            Board.created_by_id == current_user.id
        )
        .first()
    )
    
    if not column:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Column not found"
        )
    
    if column_data.name is not None:
        column.name = column_data.name
    if column_data.position is not None:
        column.position = column_data.position
    if column_data.color is not None:
        column.color = column_data.color
    if column_data.wip_limit is not None:
        column.wip_limit = column_data.wip_limit
    
    db.commit()
    db.refresh(column)
    
    return BoardColumnResponse(
        id=column.id,
        board_id=column.board_id,
        name=column.name,
        position=column.position,
        color=column.color,
        wip_limit=column.wip_limit,
        created_at=column.created_at,
        updated_at=column.updated_at
    )

@router.delete("/columns/{column_id}")
async def delete_column(
    column_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a column"""
    column = (
        db.query(BoardColumn)
        .join(Board)
        .filter(
            BoardColumn.id == column_id,
            Board.created_by_id == current_user.id
        )
        .first()
    )
    
    if not column:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Column not found"
        )
    
    db.delete(column)
    db.commit()
    
    return {"message": "Column deleted successfully"}

# Card endpoints
@router.post("/columns/{column_id}/cards", response_model=BoardCardResponse)
async def create_card(
    column_id: int,
    card_data: BoardCardCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new card in a column"""
    column = (
        db.query(BoardColumn)
        .join(Board)
        .filter(
            BoardColumn.id == column_id,
            Board.created_by_id == current_user.id
        )
        .first()
    )
    
    if not column:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Column not found"
        )
    
    # Verify contact exists and belongs to user
    contact = db.query(Contact).filter(
        Contact.id == card_data.contact_id,
        Contact.created_by_id == current_user.id
    ).first()
    
    if not contact:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contact not found"
        )
    
    # Check if contact is already in this board
    existing_card = db.query(BoardCard).join(BoardColumn).filter(
        BoardCard.contact_id == card_data.contact_id,
        BoardColumn.board_id == column.board_id
    ).first()
    
    if existing_card:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Contact is already on this board"
        )
    
    card = BoardCard(
        board_column_id=column_id,
        contact_id=card_data.contact_id,
        position=card_data.position,
        notes=card_data.notes,
        created_by_id=current_user.id
    )
    
    db.add(card)
    db.commit()
    db.refresh(card)
    
    # Load contact for response
    card = (
        db.query(BoardCard)
        .options(joinedload(BoardCard.contact))
        .filter(BoardCard.id == card.id)
        .first()
    )
    
    contact = card.contact
    return BoardCardResponse(
        id=card.id,
        board_column_id=card.board_column_id,
        contact_id=card.contact_id,
        position=card.position,
        notes=card.notes,
        contact=ContactSummary(
            id=contact.id,
            display_name=contact.display_name,
            full_name=contact.full_name,
            email=contact.email,
            company=contact.company,
            contact_type=contact.contact_type,
            status=contact.status,
            sales_rep_name=None
        ),
        created_by_id=card.created_by_id,
        created_at=card.created_at,
        updated_at=card.updated_at
    )

@router.put("/cards/{card_id}", response_model=BoardCardResponse)
async def update_card(
    card_id: int,
    card_data: BoardCardUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a card (move between columns or update position)"""
    card = (
        db.query(BoardCard)
        .join(BoardColumn)
        .join(Board)
        .filter(
            BoardCard.id == card_id,
            Board.created_by_id == current_user.id
        )
        .first()
    )
    
    if not card:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Card not found"
        )
    
    # If moving to a different column, verify it exists and belongs to same board
    if card_data.board_column_id and card_data.board_column_id != card.board_column_id:
        new_column = (
            db.query(BoardColumn)
            .join(Board)
            .filter(
                BoardColumn.id == card_data.board_column_id,
                Board.created_by_id == current_user.id,
                BoardColumn.board_id == card.column.board_id
            )
            .first()
        )
        
        if not new_column:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Target column not found or belongs to different board"
            )
        
        card.board_column_id = card_data.board_column_id
    
    if card_data.position is not None:
        card.position = card_data.position
    if card_data.notes is not None:
        card.notes = card_data.notes
    
    db.commit()
    db.refresh(card)
    
    # Load contact for response
    card = (
        db.query(BoardCard)
        .options(joinedload(BoardCard.contact))
        .filter(BoardCard.id == card.id)
        .first()
    )
    
    contact = card.contact
    return BoardCardResponse(
        id=card.id,
        board_column_id=card.board_column_id,
        contact_id=card.contact_id,
        position=card.position,
        notes=card.notes,
        contact=ContactSummary(
            id=contact.id,
            display_name=contact.display_name,
            full_name=contact.full_name,
            email=contact.email,
            company=contact.company,
            contact_type=contact.contact_type,
            status=contact.status,
            sales_rep_name=None
        ),
        created_by_id=card.created_by_id,
        created_at=card.created_at,
        updated_at=card.updated_at
    )

@router.delete("/cards/{card_id}")
async def delete_card(
    card_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a card"""
    card = (
        db.query(BoardCard)
        .join(BoardColumn)
        .join(Board)
        .filter(
            BoardCard.id == card_id,
            Board.created_by_id == current_user.id
        )
        .first()
    )
    
    if not card:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Card not found"
        )
    
    db.delete(card)
    db.commit()
    
    return {"message": "Card deleted successfully"}


'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plus, MoreVertical, User, Edit, Trash2, Settings, X, GripVertical } from 'lucide-react';
import { boardsApi, contactsApi } from '@/lib/api';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

interface Board {
  id: number;
  name: string;
  description?: string;
  color: string;
  columns: BoardColumn[];
}

interface BoardColumn {
  id: number;
  name: string;
  position: number;
  color?: string;
  wip_limit?: number;
  cards: BoardCard[];
}

interface BoardCard {
  id: number;
  contact_id: number;
  position: number;
  contact: {
    id: number;
    display_name: string;
    full_name: string;
    email?: string;
    company?: string;
    contact_type?: string;
    status?: string;
  };
}

export default function BoardsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [boards, setBoards] = useState<Board[]>([]);
  const [selectedBoard, setSelectedBoard] = useState<Board | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateBoard, setShowCreateBoard] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');
  const [newBoardDescription, setNewBoardDescription] = useState('');
  const [showAddColumn, setShowAddColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');
  const [showAddCard, setShowAddCard] = useState<number | null>(null);
  const [availableContacts, setAvailableContacts] = useState<any[]>([]);
  const [draggedCard, setDraggedCard] = useState<{ card: BoardCard; sourceColumnId: number } | null>(null);

  useEffect(() => {
    fetchBoards();
  }, []);

  // Check for create query parameter and open modal
  useEffect(() => {
    const createParam = searchParams.get('create');
    if (createParam === 'true') {
      setShowCreateBoard(true);
      // Remove the query parameter from URL without reloading
      router.replace('/boards');
    }
  }, [searchParams, router]);

  const fetchBoards = async () => {
    try {
      setLoading(true);
      const response = await boardsApi.list();
      setBoards(response.data);
      if (response.data.length > 0 && !selectedBoard) {
        // Load first board's details
        fetchBoardDetails(response.data[0].id);
      }
    } catch (error) {
      console.error('Error fetching boards:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBoardDetails = async (boardId: number) => {
    try {
      const response = await boardsApi.get(boardId.toString());
      setSelectedBoard(response.data);
    } catch (error) {
      console.error('Error fetching board details:', error);
    }
  };

  const handleCreateBoard = async () => {
    if (!newBoardName.trim()) {
      alert('Board name is required');
      return;
    }

    try {
      console.log('Creating board with data:', {
        name: newBoardName.trim(),
        description: newBoardDescription || undefined,
      });
      const response = await boardsApi.create({
        name: newBoardName.trim(),
        description: newBoardDescription || undefined,
      });
      console.log('Board created successfully:', response.data);
      setBoards([...boards, response.data]);
      setNewBoardName('');
      setNewBoardDescription('');
      setShowCreateBoard(false);
      fetchBoardDetails(response.data.id);
    } catch (error: any) {
      console.error('Error creating board:', error);
      console.error('Error response:', error?.response);
      console.error('Error config:', error?.config);
      const errorMessage = error?.response?.data?.detail || error?.response?.data?.message || error?.message || 'Failed to create board';
      alert(errorMessage);
    }
  };

  const handleCreateColumn = async () => {
    if (!newColumnName.trim() || !selectedBoard) {
      alert('Column name is required');
      return;
    }

    try {
      const position = selectedBoard.columns.length;
      await boardsApi.createColumn(selectedBoard.id.toString(), {
        name: newColumnName.trim(),
        position: position,
      });
      setNewColumnName('');
      setShowAddColumn(false);
      fetchBoardDetails(selectedBoard.id);
    } catch (error: any) {
      alert(error?.response?.data?.detail || 'Failed to create column');
    }
  };

  const handleDeleteColumn = async (columnId: number) => {
    if (!confirm('Are you sure you want to delete this column? All cards will be deleted.')) {
      return;
    }

    try {
      await boardsApi.deleteColumn(columnId.toString());
      if (selectedBoard) {
        fetchBoardDetails(selectedBoard.id);
      }
    } catch (error: any) {
      alert(error?.response?.data?.detail || 'Failed to delete column');
    }
  };

  const handleAddCardClick = async (columnId: number) => {
    try {
      const response = await contactsApi.list();
      // Filter out contacts already on the board
      const boardContactIds = new Set(
        selectedBoard?.columns.flatMap(col => col.cards?.map(card => card.contact_id) || []) || []
      );
      const available = response.data.filter((c: any) => !boardContactIds.has(c.id));
      setAvailableContacts(available);
      setShowAddCard(columnId);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    }
  };

  const handleAddCard = async (columnId: number, contactId: number) => {
    if (!selectedBoard) return;

    try {
      const column = selectedBoard.columns.find(col => col.id === columnId);
      const position = column?.cards?.length || 0;
      await boardsApi.createCard(columnId.toString(), {
        contact_id: contactId,
        position: position,
      });
      setShowAddCard(null);
      fetchBoardDetails(selectedBoard.id);
    } catch (error: any) {
      alert(error?.response?.data?.detail || 'Failed to add card');
    }
  };

  const handleDeleteCard = async (cardId: number) => {
    if (!confirm('Are you sure you want to remove this card from the board?')) {
      return;
    }

    try {
      await boardsApi.deleteCard(cardId.toString());
      if (selectedBoard) {
        fetchBoardDetails(selectedBoard.id);
      }
    } catch (error: any) {
      alert(error?.response?.data?.detail || 'Failed to delete card');
    }
  };

  const handleDragStart = (e: React.DragEvent, card: BoardCard, sourceColumnId: number) => {
    setDraggedCard({ card, sourceColumnId });
    e.dataTransfer.effectAllowed = 'move';
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.5';
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1';
    }
    if (!draggedCard) {
      setDraggedCard(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.classList.add('bg-blue-50');
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.classList.remove('bg-blue-50');
    }
  };

  const handleDrop = async (e: React.DragEvent, targetColumnId: number) => {
    e.preventDefault();
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.classList.remove('bg-blue-50');
    }
    
    if (!draggedCard || !selectedBoard) return;

    const { card, sourceColumnId } = draggedCard;
    
    if (sourceColumnId === targetColumnId) {
      setDraggedCard(null);
      return;
    }

    try {
      const targetColumn = selectedBoard.columns.find(col => col.id === targetColumnId);
      const position = targetColumn?.cards?.length || 0;
      
      await boardsApi.updateCard(card.id.toString(), {
        board_column_id: targetColumnId,
        position: position,
      });
      
      setDraggedCard(null);
      fetchBoardDetails(selectedBoard.id);
    } catch (error: any) {
      alert(error?.response?.data?.detail || 'Failed to move card');
      setDraggedCard(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse mx-auto mb-4"></div>
          <p className="text-gray-600">Loading boards...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Boards</h1>
            <button
              onClick={() => setShowCreateBoard(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Create Board
            </button>
          </div>
        </div>
      </div>

      {/* Board Selector */}
      {boards.length > 0 && (
        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-2 overflow-x-auto">
            {boards.map((board) => (
              <button
                key={board.id}
                onClick={() => fetchBoardDetails(board.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  selectedBoard?.id === board.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {board.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Create Board Modal */}
      {showCreateBoard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Board</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Board Name *
                </label>
                <input
                  type="text"
                  value={newBoardName}
                  onChange={(e) => setNewBoardName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Sales, Production, Claims"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  value={newBoardDescription}
                  onChange={(e) => setNewBoardDescription(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter board description..."
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleCreateBoard}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create Board
                </button>
                <button
                  onClick={() => {
                    setShowCreateBoard(false);
                    setNewBoardName('');
                    setNewBoardDescription('');
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Board Content */}
      {selectedBoard ? (
        <div className="p-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{selectedBoard.name}</h2>
              {selectedBoard.description && (
                <p className="text-sm text-gray-600 mt-1">{selectedBoard.description}</p>
              )}
            </div>
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                  <MoreVertical className="h-5 w-5" />
                </button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content className="bg-white rounded-md shadow-lg border border-gray-200 p-1 min-w-[150px]">
                  <DropdownMenu.Item className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 rounded hover:bg-gray-100 cursor-pointer">
                    <Settings className="h-4 w-4" />
                    Board Settings
                  </DropdownMenu.Item>
                  <DropdownMenu.Separator className="h-px bg-gray-200 my-1" />
                  <DropdownMenu.Item className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 rounded hover:bg-red-50 cursor-pointer">
                    <Trash2 className="h-4 w-4" />
                    Delete Board
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </div>

          {/* Kanban Board */}
          <div className="flex gap-4 overflow-x-auto pb-4">
            {selectedBoard.columns.length === 0 ? (
              <div className="flex-1 text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-gray-500 mb-4">No columns yet</p>
                <button 
                  onClick={() => setShowAddColumn(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add First Column
                </button>
              </div>
            ) : (
              <>
                {selectedBoard.columns.map((column) => (
                  <div
                    key={column.id}
                    className="flex-shrink-0 w-80 bg-gray-100 rounded-lg p-4 flex flex-col"
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, column.id)}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900">{column.name}</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">({column.cards?.length || 0})</span>
                        <DropdownMenu.Root>
                          <DropdownMenu.Trigger asChild>
                            <button className="p-1 text-gray-400 hover:text-gray-600 rounded">
                              <MoreVertical className="h-4 w-4" />
                            </button>
                          </DropdownMenu.Trigger>
                          <DropdownMenu.Portal>
                            <DropdownMenu.Content className="bg-white rounded-md shadow-lg border border-gray-200 p-1 min-w-[150px]">
                              <DropdownMenu.Item 
                                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 rounded hover:bg-gray-100 cursor-pointer"
                                onSelect={() => handleAddCardClick(column.id)}
                              >
                                <Plus className="h-4 w-4" />
                                Add Card
                              </DropdownMenu.Item>
                              <DropdownMenu.Separator className="h-px bg-gray-200 my-1" />
                              <DropdownMenu.Item 
                                className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 rounded hover:bg-red-50 cursor-pointer"
                                onSelect={() => handleDeleteColumn(column.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                                Delete Column
                              </DropdownMenu.Item>
                            </DropdownMenu.Content>
                          </DropdownMenu.Portal>
                        </DropdownMenu.Root>
                      </div>
                    </div>
                  <div 
                    className="flex-1 space-y-2 min-h-[200px] overflow-y-auto"
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, column.id)}
                  >
                      {column.cards && column.cards.length > 0 ? (
                        column.cards.map((card) => (
                          <div
                            key={card.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, card, column.id)}
                            onDragEnd={handleDragEnd}
                            className="bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow cursor-move group relative"
                            onClick={() => router.push(`/contacts/${card.contact.id}`)}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="font-medium text-gray-900">{card.contact.full_name}</div>
                                {card.contact.company && (
                                  <div className="text-sm text-gray-500 mt-1">{card.contact.company}</div>
                                )}
                                {card.contact.contact_type && (
                                  <div className="text-xs text-gray-400 mt-1">{card.contact.contact_type}</div>
                                )}
                                {card.contact.status && (
                                  <span className="inline-block mt-2 px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-700 rounded">
                                    {card.contact.status}
                                  </span>
                                )}
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteCard(card.id);
                                }}
                                className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-600 transition-opacity"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div 
                          className="text-center py-8 text-gray-400 text-sm border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-300 hover:text-blue-500 transition-colors"
                          onClick={() => handleAddCardClick(column.id)}
                        >
                          <Plus className="h-5 w-5 mx-auto mb-2" />
                          Add Card
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => handleAddCardClick(column.id)}
                      className="mt-2 w-full py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add Card
                    </button>
                  </div>
                ))}
                {/* Add Column Button */}
                <div className="flex-shrink-0 w-80">
                  <button
                    onClick={() => setShowAddColumn(true)}
                    className="w-full h-full min-h-[400px] bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-gray-50 transition-colors flex flex-col items-center justify-center gap-2 text-gray-500 hover:text-blue-600"
                  >
                    <Plus className="h-6 w-6" />
                    <span className="font-medium">Add Column</span>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Add Column Modal */}
          {showAddColumn && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Column</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Column Name *
                    </label>
                    <input
                      type="text"
                      value={newColumnName}
                      onChange={(e) => setNewColumnName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Future Client, Pre-inspection"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleCreateColumn();
                        }
                      }}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleCreateColumn}
                      disabled={!newColumnName.trim()}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Add Column
                    </button>
                    <button
                      onClick={() => {
                        setShowAddColumn(false);
                        setNewColumnName('');
                      }}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Add Card Modal */}
          {showAddCard !== null && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-hidden flex flex-col">
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Add Card to Column</h3>
                  <button
                    onClick={() => setShowAddCard(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-6">
                  {availableContacts.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                      All contacts are already on this board
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {availableContacts.map((contact) => (
                        <button
                          key={contact.id}
                          onClick={() => handleAddCard(showAddCard, contact.id)}
                          className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200"
                        >
                          <div className="font-medium text-gray-900">{contact.full_name}</div>
                          {contact.email && (
                            <div className="text-sm text-gray-500">{contact.email}</div>
                          )}
                          {contact.company && (
                            <div className="text-sm text-gray-500">{contact.company}</div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-gray-500 mb-4">No boards yet</p>
            <button
              onClick={() => setShowCreateBoard(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create Your First Board
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


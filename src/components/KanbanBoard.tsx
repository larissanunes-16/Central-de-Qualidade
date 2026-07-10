"use client";

import { useState } from "react";
import { DragDropContext, Draggable, Droppable, type DropResult } from "@hello-pangea/dnd";
import clsx from "clsx";
import type { CardMelhoria, EstadoCard } from "@/types";

const COLUNAS: { estado: EstadoCard; label: string }[] = [
  { estado: "PENDENTE", label: "Pendente" },
  { estado: "EM_ANDAMENTO", label: "Em andamento" },
  { estado: "CONCLUIDO", label: "Concluído" },
];

export function KanbanBoard({
  cards,
  onMoverCard,
  onAtribuirResponsavel,
}: {
  cards: CardMelhoria[];
  onMoverCard: (cardId: string, novoEstado: EstadoCard) => void;
  onAtribuirResponsavel: (cardId: string, responsavel: string) => void;
}) {
  const [cardEditando, setCardEditando] = useState<string | null>(null);
  const [valorResponsavel, setValorResponsavel] = useState("");

  function onDragEnd(resultado: DropResult) {
    const { source, destination, draggableId } = resultado;
    if (!destination) return;
    if (destination.droppableId === source.droppableId) return;
    onMoverCard(draggableId, destination.droppableId as EstadoCard);
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {COLUNAS.map((coluna) => {
          const cardsColuna = cards.filter((c) => c.estado === coluna.estado);
          return (
            <Droppable droppableId={coluna.estado} key={coluna.estado}>
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps} className="flex flex-col gap-3 rounded-xl bg-slate-50 p-3">
                  <div className="flex items-center justify-between px-1">
                    <p className="text-sm font-semibold text-slate-700">{coluna.label}</p>
                    <span className="badge bg-slate-200 text-slate-600">{cardsColuna.length}</span>
                  </div>

                  {cardsColuna.map((card, index) => (
                    <Draggable draggableId={card.id} index={index} key={card.id} isDragDisabled={card.estado === "CONCLUIDO"}>
                      {(providedDraggable) => (
                        <div
                          ref={providedDraggable.innerRef}
                          {...providedDraggable.draggableProps}
                          {...providedDraggable.dragHandleProps}
                          className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-medium text-slate-800">{card.titulo}</p>
                            {card.estado === "CONCLUIDO" && <span className="text-emerald-500">✓</span>}
                          </div>
                          <span className="w-fit rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">{card.categoria}</span>

                          {cardEditando === card.id ? (
                            <div className="flex gap-1">
                              <input
                                autoFocus
                                value={valorResponsavel}
                                onChange={(e) => setValorResponsavel(e.target.value)}
                                className="flex-1 rounded border border-slate-200 px-2 py-1 text-xs"
                                placeholder="Nome do responsável"
                              />
                              <button
                                onClick={() => {
                                  if (valorResponsavel.trim()) onAtribuirResponsavel(card.id, valorResponsavel.trim());
                                  setCardEditando(null);
                                }}
                                className="rounded bg-brand-600 px-2 py-1 text-xs font-semibold text-white"
                              >
                                OK
                              </button>
                            </div>
                          ) : (
                            <button
                              disabled={card.estado === "CONCLUIDO"}
                              onClick={() => {
                                setCardEditando(card.id);
                                setValorResponsavel(card.responsavel ?? "");
                              }}
                              className={clsx(
                                "w-fit text-left text-xs",
                                card.responsavel ? "text-slate-500" : "font-medium text-brand-600",
                                card.estado !== "CONCLUIDO" && "hover:underline",
                              )}
                            >
                              {card.responsavel ? `Responsável: ${card.responsavel}` : "Atribuir responsável"}
                            </button>
                          )}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          );
        })}
      </div>
    </DragDropContext>
  );
}

export function pipelineSelectionReducer(selection, action) {
  switch (action.type) {
    case 'select-stage':
      return action.id ? { type: 'stage', id: action.id } : null;
    case 'toggle-storage':
      return selection?.type === 'storage' && selection.id === action.id
        ? null
        : { type: 'storage', id: action.id };
    case 'deselect-storage':
      return selection?.type === 'storage' && selection.id === action.id ? null : selection;
    case 'context-changed':
      return selection?.type === 'storage' ? null : selection;
    default:
      return selection;
  }
}

export function metagraph(state = {}, action) {
  switch (action.type) {
    case 'set_definitions':
      return action.payload.metagraph || {};
    default:
      return state;
  }
}

export function hetioStyles(state = {}, action) {
  switch (action.type) {
    case 'set_definitions':
      return action.payload.hetioStyles || {};
    default:
      return state;
  }
}

export function tooltipDefinitions(state = {}, action) {
  switch (action.type) {
    case 'set_definitions':
      return action.payload.tooltipDefinitions || {};
    default:
      return state;
  }
}

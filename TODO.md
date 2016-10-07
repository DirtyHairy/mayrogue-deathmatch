# Required

## Reworked interaction handling and client communication

This is a requirement for cleanly adding more modes of interaction (items!).

### Client side

 * All entity actions are converted to action objects

 * Simulation engine observes actions and mutates local world state accordingly. Rollback
   changes are determined and stacked.

 * Actions are transmitted to server. Each action has an incrementing sequence number

 * World updates are received from the server. Each update package contains the
   sequence number of the last action taken into account.

 * Received updates are stacked until the sequence number from the server matches
   that of the last action. Mitigations if the stack exceeds a size limit:

   * Block user interaction until all actions have been accounted for

   * If a timeout is exceeded: state reload

 * Once all actions have been accounted for: rollback local state changes and
   update world state according to server changes.

### Server side

  * Client actions are stacked and last sequence number is recorded

  * Every timeslice concludes with a spin of the simulation engine

  * The simulation engine processes entities in random order

    * NPC entities: brain acts on current world state and emits actions accordingly

    * Player entites: action stack is subjected to rate limits and actions are applied or
      rejected

  * Each client receives individual update package, including the last recorded sequence
    number and the timeslice index

### Message ordering / dropout detection

Depending on the transport used, socket.io messages might be received out-of-order
or dropped (confirm?). This is handled by a transport layer *below* the actual protocol outlined
above by assigning and verifying sequence numbers (these are different from the action
sequence number detailed above).

Mitigation for non-recoverable communication errors (client side)
  * Client side: state reload
  * Server side: warning message sent to client, triggers state reload

### State reload and connection reset

During state reload, the client re-requests the full world state from the server.
While waiting for the state update, the game blocks and the transport layer will discard
all communication. On receiving the state message, the transport layer records the sequence number
of the package. All received messages with sequence numbers lower than this reference will
be discarded. Similarly, the server will discard all client messages with sequence numbers
lower than that of the state request message.

# Optional

## Entity map

A spatial map of the world, referencing entities by occupied tile. Will
dramatically speed up collision checks.

## Custom A* pathfinding implementation

A custom A* implementation that supports arbitrary graphs. Will avoid duplicated state
(currently, the library holds a copy of the map) and allow proper pathfinding for
entities larger than one tile (hi mr. tentacle guy).

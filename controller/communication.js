import fight from "./fight.js";
import matchmaking from "./matchmaking.js";

const matchmakingModule = matchmaking();
const fightModule = fight();

//create a return handler that is a function where you send the status and the data from the controllers
//try enhancing _socketTo to handle returns better

const comm = (io) => {
	const playerSockets = {};

	io.on("connection", (socket) => {
		console.log("user connected!");

		socket.on("disconnect", () => {
			//send the disconnected player to "fight" to inform the other player that he won and that the opponent has disconnected
			//remove the match from matchFight
			let keyToDelete;
			for (const [key, value] of Object.entries(playerSockets)) {
				if (value === socket.id) keyToDelete = key;
			}
			if (keyToDelete) delete playerSockets[keyToDelete];
		});
	});

	const init = (playerID, socketID) => {
		const initialized = _playerInit(playerID, socketID);
		if (initialized) {
			const { status, matchIDs } = matchmakingModule.addPlayer(playerID);
			if (status >= 2) {
				const [match, fightID] = fightModule.ready(matchIDs);
				return _socketTo(match, "combat-started", { match, fightID }, status);
			} else if (status >= 1)
				return _socketTo(playerID, "combat-pending", "", status);
			else return status;
		} else return 3;
	};

	const _playerInit = (playerID, socketID) => {
		if (playerID && socketID && !playerSockets[playerID]) {
			playerSockets[playerID] = socketID;
			return true;
		} else return false;
	};

	const actions = (actions, playerID, fightID) => {
		if (playerSockets[playerID]) {
			const { status, match } = fightModule.waitActions(
				actions,
				playerID,
				fightID
			);
			if (status >= 2) return _socketTo(match, "action-done", match, status);
			else if (status >= 1)
				return _socketTo(playerID, "action-pending", "", status);
			else return status;
		} else return 3;
	};

	const _socketTo = (target, emit, data, status) => {
		if (typeof target !== "object" && typeof target === "string")
			io.to(playerSockets[target], emit, data);
		else {
			for (const [key, value] of Object.entries(target)) {
				io.to(playerSockets[key]).emit(emit, data);
			}
		}
		return status;
	};

	return { init, actions };
};

export { comm };

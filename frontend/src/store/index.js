/* eslint-disable import/no-cycle */
import { createStore } from "vuex";

import websockets from "./modules/websockets";

import user from "./modules/user";
import settings from "./modules/settings";
import modalVisibility from "./modules/modalVisibility";
import station from "./modules/station";
import admin from "./modules/admin";

import editSongModal from "./modules/modals/editSong";
import importAlbumModal from "./modules/modals/importAlbum";
import editPlaylistModal from "./modules/modals/editPlaylist";
import manageStationModal from "./modules/modals/manageStation";
import editUserModal from "./modules/modals/editUser";
import viewPunishmentModal from "./modules/modals/viewPunishment";
import viewReportModal from "./modules/modals/viewReport";
import reportModal from "./modules/modals/report";

export default createStore({
	modules: {
		websockets,
		user,
		settings,
		station,
		admin,
		modalVisibility,
		modals: {
			namespaced: true,
			modules: {
				editSong: editSongModal,
				importAlbum: importAlbumModal,
				editPlaylist: editPlaylistModal,
				manageStation: manageStationModal,
				editUser: editUserModal,
				viewPunishment: viewPunishmentModal,
				report: reportModal,
				viewReport: viewReportModal
			}
		}
	},
	strict: false
});

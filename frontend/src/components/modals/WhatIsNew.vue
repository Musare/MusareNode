<template>
	<div v-if="news !== null">
		<modal title="News" class="what-is-news-modal">
			<template #body>
				<div
					class="section news-item"
					v-html="sanitize(marked(news.markdown))"
				></div>
			</template>
			<template #footer>
				<span v-if="news.createdBy">
					By
					<user-id-to-username
						:user-id="news.createdBy"
						:alt="news.createdBy"
						:link="true" /></span
				><span :title="new Date(news.createdAt)">
					{{
						formatDistance(news.createdAt, new Date(), {
							addSuffix: true
						})
					}}
				</span>
			</template>
		</modal>
	</div>
	<div v-else></div>
</template>

<script>
import { formatDistance } from "date-fns";
import marked from "marked";
import { sanitize } from "dompurify";
import { mapGetters, mapActions } from "vuex";

import UserIdToUsername from "@/components/UserIdToUsername.vue";
import Modal from "../Modal.vue";

export default {
	components: { Modal, UserIdToUsername },
	data() {
		return {
			isModalActive: false,
			news: null
		};
	},
	computed: {
		...mapGetters({
			socket: "websockets/getSocket"
		})
	},
	mounted() {
		marked.use({
			renderer: {
				table(header, body) {
					return `<table class="table is-striped">
					<thead>${header}</thead>
					<tbody>${body}</tbody>
					</table>`;
				}
			}
		});

		this.socket.dispatch("news.newest", res => {
			if (res.status !== "success") return;

			const { news } = res.data;

			this.news = news;
			if (this.news && localStorage.getItem("firstVisited")) {
				if (localStorage.getItem("whatIsNew")) {
					if (
						parseInt(localStorage.getItem("whatIsNew")) <
						news.createdAt
					) {
						this.openModal("whatIsNew");
						localStorage.setItem("whatIsNew", news.createdAt);
					}
				} else {
					if (
						parseInt(localStorage.getItem("firstVisited")) <
						news.createdAt
					)
						this.openModal("whatIsNew");
					localStorage.setItem("whatIsNew", news.createdAt);
				}
			} else if (!localStorage.getItem("firstVisited"))
				localStorage.setItem("firstVisited", Date.now());
		});
	},
	methods: {
		marked,
		sanitize,
		formatDistance,
		...mapActions("modalVisibility", ["openModal"])
	}
};
</script>

<style lang="scss">
.what-is-news-modal {
	.modal-card {
		.modal-card-foot {
			span:not(:last-child) {
				margin-right: 5px !important;
			}
		}
	}
}
</style>

<style lang="scss" scoped>
.night-mode {
	.modal-card,
	.modal-card-head,
	.modal-card-body {
		background-color: var(--dark-grey-3);
	}

	strong,
	p {
		color: var(--light-grey-2);
	}
}

.modal-card-head {
	border-bottom: none;
	background-color: ghostwhite;
	padding: 15px;
}

.modal-card-title {
	font-size: 14px;
}

.news-item {
	box-shadow: unset !important;
}

.delete {
	background: transparent;
	&:hover {
		background: transparent;
	}

	&:before,
	&:after {
		background-color: var(--light-grey-3);
	}
}

.sect {
	div[class^="sect-head"],
	div[class*=" sect-head"] {
		padding: 12px;
		text-transform: uppercase;
		font-weight: bold;
		color: var(--white);
	}

	.sect-head-features {
		background-color: dodgerblue;
	}
	.sect-head-improvements {
		background-color: seagreen;
	}
	.sect-head-bugs {
		background-color: brown;
	}
	.sect-head-upcoming {
		background-color: mediumpurple;
	}

	.sect-body {
		padding: 15px 25px;

		li {
			list-style-type: disc;
		}
	}
}
</style>

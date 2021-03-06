<template>
	<div class="app">
		<metadata title="News" />
		<main-header />
		<div class="container">
			<div class="content-wrapper">
				<h1 class="has-text-centered page-title">News</h1>
				<div
					v-for="item in news"
					:key="item._id"
					class="section news-item"
				>
					<div v-html="sanitize(marked(item.markdown))"></div>
					<div class="info">
						<hr />
						By
						<user-id-to-username
							:user-id="item.createdBy"
							:alt="item.createdBy"
							:link="true"
						/>

						<span :title="new Date(item.createdAt)">
							{{
								formatDistance(item.createdAt, new Date(), {
									addSuffix: true
								})
							}}
						</span>
					</div>
				</div>
				<h3 v-if="news.length === 0" class="has-text-centered">
					No news items were found.
				</h3>
			</div>
		</div>
		<main-footer />
	</div>
</template>

<script>
import { formatDistance } from "date-fns";
import { mapGetters } from "vuex";
import marked from "marked";
import { sanitize } from "dompurify";

import ws from "@/ws";

import MainHeader from "@/components/layout/MainHeader.vue";
import MainFooter from "@/components/layout/MainFooter.vue";
import UserIdToUsername from "@/components/UserIdToUsername.vue";

export default {
	components: { MainHeader, MainFooter, UserIdToUsername },
	data() {
		return {
			news: []
		};
	},
	computed: mapGetters({
		socket: "websockets/getSocket"
	}),
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

		this.socket.dispatch("news.index", res => {
			if (res.status === "success") this.news = res.data.news;
		});

		this.socket.on("event:news.created", res =>
			this.news.unshift(res.data.news)
		);

		this.socket.on("event:news.updated", res => {
			if (res.data.news.status === "draft") {
				this.news = this.news.filter(
					item => item._id !== res.data.news._id
				);
				return;
			}

			for (let n = 0; n < this.news.length; n += 1) {
				if (this.news[n]._id === res.data.news._id)
					this.$set(this.news, n, {
						...this.news[n],
						...res.data.news
					});
			}
		});

		this.socket.on("event:news.deleted", res => {
			this.news = this.news.filter(item => item._id !== res.data.newsId);
		});

		if (this.socket.readyState === 1) this.init();
		ws.onConnect(() => this.init());
	},
	methods: {
		marked,
		sanitize,
		formatDistance,
		init() {
			this.socket.dispatch("apis.joinRoom", "news");
		}
	}
};
</script>

<style lang="scss" scoped>
.night-mode {
	p {
		color: var(--light-grey-2);
	}
}

.section {
	border: 1px solid var(--light-grey-3);
	width: 1000px;
	max-width: 100%;
	margin-top: 50px;

	&:last-of-type {
		margin-bottom: 50px;
	}
}
</style>

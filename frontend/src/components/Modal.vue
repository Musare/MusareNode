<template>
	<div class="modal is-active">
		<div class="modal-background" @click="closeCurrentModal()" />
		<div class="modal-card">
			<header class="modal-card-head">
				<h2 class="modal-card-title is-marginless">
					{{ title }}
				</h2>
				<button class="delete" @click="closeCurrentModal()" />
			</header>
			<section class="modal-card-body">
				<slot name="body" />
			</section>
			<footer class="modal-card-foot" v-if="$slots['footer'] != null">
				<slot name="footer" />
			</footer>
		</div>
	</div>
</template>

<script>
import { mapActions } from "vuex";

export default {
	props: {
		title: { type: String, default: "Modal" }
	},
	mounted() {
		this.type = this.toCamelCase(this.title);
	},
	methods: {
		toCamelCase: str =>
			str
				.toLowerCase()
				.replace(/[-_]+/g, " ")
				.replace(/[^\w\s]/g, "")
				.replace(/ (.)/g, $1 => $1.toUpperCase())
				.replace(/ /g, ""),
		...mapActions("modalVisibility", ["closeCurrentModal"])
	}
};
</script>

<style lang="scss" scoped>
.night-mode {
	.modal-card-head,
	.modal-card-foot {
		background-color: var(--dark-grey-3);
		border-color: var(--dark-grey-2);
	}

	.modal-card-body {
		background-color: var(--dark-grey-4) !important;
	}

	.modal-card-title {
		color: var(--white);
	}

	p,
	label,
	td,
	th {
		color: var(--light-grey-2) !important;
	}

	h1,
	h2,
	h3,
	h4,
	h5,
	h6 {
		color: var(--white) !important;
	}
}

.modal-card {
	width: 800px;
	font-size: 16px;
}

p {
	font-size: 17px;
}

.modal-card-title {
	font-size: 27px;
}

.modal-card-foot {
	overflow: initial;

	&::v-deep {
		& > div {
			display: flex;
			flex-grow: 1;
			column-gap: 16px;
		}

		.right {
			margin-left: auto;
			justify-content: flex-end;
			column-gap: 16px;
		}
	}
}

@media screen and (max-width: 600px) {
	.modal-card {
		max-height: none;

		.modal-card-body {
			// padding: 0;
		}

		.modal-card-head,
		.modal-card-foot {
			border-radius: 0;
		}
	}
}

@media screen and (max-height: 650px) {
	.modal-card {
		height: 100%;
	}
}
</style>

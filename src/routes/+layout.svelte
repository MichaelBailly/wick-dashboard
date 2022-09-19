<script lang="ts">
	import Drawer, { AppContent, Content } from '@smui/drawer';
	import List, { Item, Text } from '@smui/list';
</script>

<div class="page-container">
	<Drawer>
		<Content>
			<List>
				<Item href="/">
					<Text>Home</Text>
				</Item>
				<Item href="/history">
					<Text>History</Text>
				</Item>
			</List>
		</Content>
	</Drawer>
	<AppContent class="app-content">
		<main class="main-content">
			<slot />
		</main>
	</AppContent>
</div>

<style>
	.page-container {
		display: flex;
		flex-direction: row;
	}

	.main-content {
		padding: 1rem;
		flex-grow: 1;
	}

	* :global(.app-content) {
		flex-grow: 1;
	}
</style>

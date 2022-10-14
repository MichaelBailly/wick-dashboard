<script lang="ts">
	import '@fontsource/roboto-mono';
	import '@fontsource/roboto/300.css';
	import '@fontsource/roboto/400.css';
	import '@fontsource/roboto/500.css';
	import '@fontsource/roboto/700.css';
	import Drawer, { AppContent, Content } from '@smui/drawer';
	import List, { Item, Text } from '@smui/list';
	import 'material-icons/iconfont/material-icons.css';
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
				<Item href="/daily">
					<Text>Daily PnL</Text>
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

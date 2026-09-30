<script lang="ts">
	import type { PromotionPiece } from '$lib/chess/game';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';

	type Props = {
		open: boolean;
		onchoose: (piece: PromotionPiece) => void;
		oncancel: () => void;
	};

	type PromotionOption = {
		piece: PromotionPiece;
		label: string;
	};

	const options: PromotionOption[] = [
		{ piece: 'q', label: 'Queen' },
		{ piece: 'r', label: 'Rook' },
		{ piece: 'b', label: 'Bishop' },
		{ piece: 'n', label: 'Knight' }
	];

	let { open, onchoose, oncancel }: Props = $props();
</script>

<Dialog.Root {open} onOpenChange={(value) => !value && oncancel()}>
	<Dialog.Content class="sm:max-w-sm">
		<Dialog.Header>
			<Dialog.Title>Promote pawn</Dialog.Title>
			<Dialog.Description>Choose a piece to complete your move.</Dialog.Description>
		</Dialog.Header>
		<div class="grid grid-cols-2 gap-2">
			{#each options as option (option.piece)}
				<Button variant="outline" onclick={() => onchoose(option.piece)}>{option.label}</Button>
			{/each}
		</div>
	</Dialog.Content>
</Dialog.Root>

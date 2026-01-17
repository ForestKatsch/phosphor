import type { PathSegment } from "./path";

export type MatchResult<THandler> = {
	value: THandler;
	params: Record<string, string>;
	wildcard?: string[];
};

export type TrieEntry<THandler> = {
	path: PathSegment[];
	value: THandler;
};

type ParamEdge<THandler> = {
	name: string;
	node: TrieNode<THandler>;
};

type WildcardEdge<THandler> = {
	node: TrieNode<THandler>;
};

class TrieNode<THandler> {
	readonly literals = new Map<string, TrieNode<THandler>>();
	readonly params: ParamEdge<THandler>[] = [];
	readonly wildcards: WildcardEdge<THandler>[] = [];
	value?: THandler;
}

export class Trie<THandler> {
	private readonly root = new TrieNode<THandler>();

	insert(path: PathSegment[], value: THandler) {
		let node: TrieNode<THandler> = this.root;
		for (const segment of path) {
			switch (segment.type) {
				case "literal": {
					let next = node.literals.get(segment.value);
					if (!next) {
						next = new TrieNode<THandler>();
						node.literals.set(segment.value, next);
					}
					node = next;
					break;
				}
				case "variable": {
					const existing = node.params.find(
						(edge) => edge.name === segment.value,
					);
					if (existing) {
						node = existing.node;
						break;
					}

					const next = new TrieNode<THandler>();
					node.params.push({ name: segment.value, node: next });
					node = next;
					break;
				}
				case "wildcard": {
					const next = new TrieNode<THandler>();
					node.wildcards.push({ node: next });
					node = next;
					break;
				}
			}
		}

		node.value = value;
	}

	getValue(path: PathSegment[]): THandler | undefined {
		let node: TrieNode<THandler> = this.root;
		for (const segment of path) {
			switch (segment.type) {
				case "literal": {
					const next = node.literals.get(segment.value);
					if (!next) {
						return undefined;
					}
					node = next;
					break;
				}
				case "variable": {
					const next = node.params.find(
						(edge) => edge.name === segment.value,
					)?.node;
					if (!next) {
						return undefined;
					}
					node = next;
					break;
				}
				case "wildcard": {
					const next = node.wildcards[0]?.node;
					if (!next) {
						return undefined;
					}
					node = next;
					break;
				}
			}
		}
		return node.value;
	}

	match(path: PathSegment[]): MatchResult<THandler> | null {
		return this.matchFromNode(this.root, path, 0, {}, path);
	}

	entries(): TrieEntry<THandler>[] {
		const results: TrieEntry<THandler>[] = [];
		const visit = (node: TrieNode<THandler>, path: PathSegment[]) => {
			if (node.value) {
				results.push({ path, value: node.value });
			}

			node.literals.forEach((child, literal) => {
				visit(child, [...path, { type: "literal", value: literal }]);
			});

			for (const param of node.params) {
				visit(param.node, [...path, { type: "variable", value: param.name }]);
			}

			for (const wildcard of node.wildcards) {
				visit(wildcard.node, [...path, { type: "wildcard", value: "*" }]);
			}
		};

		visit(this.root, []);
		return results;
	}

	private matchFromNode(
		node: TrieNode<THandler>,
		segments: PathSegment[],
		index: number,
		params: Record<string, string>,
		originalPath: PathSegment[],
	): MatchResult<THandler> | null {
		if (index >= segments.length) {
			if (node.value) {
				return { value: node.value, params };
			}

			for (const wildcard of node.wildcards) {
				if (wildcard.node.value) {
					return { value: wildcard.node.value, params, wildcard: [] };
				}
			}

			return null;
		}

		const segment = segments[index];
		if (!segment) {
			return null;
		}

		if (segment.type === "literal") {
			const literalNode = node.literals.get(segment.value);
			if (literalNode) {
				const match = this.matchFromNode(
					literalNode,
					segments,
					index + 1,
					params,
					originalPath,
				);
				if (match) {
					return match;
				}
			}
		}

		for (const param of node.params) {
			const nextParams = { ...params, [param.name]: segment.value };
			const match = this.matchFromNode(
				param.node,
				segments,
				index + 1,
				nextParams,
				originalPath,
			);
			if (match) {
				return match;
			}
		}

		for (const wildcard of node.wildcards) {
			if (wildcard.node.value) {
				return {
					value: wildcard.node.value,
					params,
					wildcard: originalPath.slice(index).map((item) => item.value),
				};
			}
		}

		return null;
	}
}

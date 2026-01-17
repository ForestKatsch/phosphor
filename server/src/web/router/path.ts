export type LiteralSegment<Value extends string = string> = {
  type: "literal";
  value: Value;
};

export type VariableSegment<Value extends string = string> = {
  type: "variable";
  value: Value;
};

export type WildcardSegment = {
  type: "wildcard";
  value: "*";
};

export type PathSegment = LiteralSegment | VariableSegment | WildcardSegment;

type TrimLeadingSlash<Path extends string> = Path extends `/${infer Rest}`
  ? TrimLeadingSlash<Rest>
  : Path;

type TrimTrailingSlash<Path extends string> = Path extends `${infer Rest}/`
  ? TrimTrailingSlash<Rest>
  : Path;

type NormalizePath<Path extends string> = TrimTrailingSlash<TrimLeadingSlash<Path>>;

type ParseSegment<Segment extends string> = Segment extends "*"
  ? WildcardSegment
  : Segment extends `:${infer Name}`
  ? VariableSegment<Name>
  : LiteralSegment<Segment>;

type AppendSegment<
  Segments extends PathSegment[],
  Segment extends string
> = Segment extends "" ? Segments : [...Segments, ParseSegment<Segment>];

type ParsePathInner<
  Path extends string,
  Segments extends PathSegment[]
> = Path extends `${infer Head}/${infer Tail}`
  ? ParsePathInner<Tail, AppendSegment<Segments, Head>>
  : AppendSegment<Segments, Path>;

export type ParsePath<Path extends string> = NormalizePath<Path> extends ""
  ? []
  : ParsePathInner<NormalizePath<Path>, []>;

export type ParamsFromSegments<Segments extends PathSegment[]> = {
  [K in Segments[number]as K["type"] extends "variable"
  ? K["value"]
  : never]: string;
};

export function parsePath(path: string): PathSegment[] {
  const normalized = path.replace(/^\/+|\/+$/g, "");
  if (!normalized) {
    return [];
  }

  return normalized.split("/").filter(Boolean).map((segment) => {
    if (segment === "*") {
      return {
        type: "wildcard",
        value: "*",
      };
    }

    if (segment.startsWith(":")) {
      return {
        type: "variable",
        value: segment.slice(1),
      };
    }

    return {
      type: "literal",
      value: segment,
    };
  });
}

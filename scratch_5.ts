@State<ItemsStateModel>({
  name: 'Items',
})
@Injectable({ providedIn: 'root' })
export class ItemsState {
  constructor(private itemsApiService: ItemsApiService) {}

  @Selector()
  static items(state: ItemsStateModel): TenderItem[] {
    return state.listItems.data;
  }

  @Selector()
  static loading(state: ItemsStateModel): boolean {
    return state.loading;
  }

  @Selector()
  static paginationLoading(state: ItemsStateModel): boolean {
    return state.paginationLoading;
  }

  @Selector()
  static errorCode(state: ItemsStateModel): number | void {
    return state?.error?.code;
  }

  @Action(LoadItems, { cancelUncompleted: true })
  loadItems<T>(
    ctx: StateContext<ItemsStateModel>,
    { itemId, payload }: LoadItems<null>,
  ): Observable<ListResponse<Item>> {
    const state = ctx.getState();
    const searchParams: ISearchParams<any> = state.searchParams || {};
    searchParams.pagination = { pageNumber: 1, size: 100 };
    if (payload.sort) {
      searchParams.sort = payload.sort;
    }
    if (payload.filter) {
      searchParams.filter = payload.filter;
    }

    ctx.patchState({ loading: true, error: null });
    return this.itemsApiService.getItemsList(itemId, payload).pipe(
      tap((items: ListResponse<Item>) => {
        ctx.patchState({ listItems: items, loading: false });
      }),
      catchError((error: HttpErrorResponse) => {
        ctx.patchState({ error: { code: error.status, message: error.message }, loading: false });
        return EMPTY;
      }),
    );
  }
}

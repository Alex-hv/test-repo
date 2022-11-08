@UntilDestroy()
@Component({
  selector: 'items-table'
})
export class itemsTableComponent implements OnInit {
  @ViewChild(CdkVirtualScrollViewport) viewPort: CdkVirtualScrollViewport;

  items$: Observable<Item[]> = this.itemsService.items$;
  loading$: Observable<boolean> = this.itemsService.loading$;
  paginationLoading$: Observable<boolean> = this.itemsService.paginationLoading$;

  tableColumns: TableColumns[];
  expandedRow: number | null;
  searchActivatedRow: number | null;
  selectedRow: number = 0;
  hiddenCursor: boolean = false;

  constructor(
    private itemsService: ItemsService,
  ) {}

  ngOnInit(): void {
    this.setTableColumns();
  }

  indexChange(): void {
    const itemsLeft = this.viewPort.getDataLength() - this.viewPort.getRenderedRange().end;
    if (itemsLeft < 50) {
      this.itemsService.loadMoreItems();
    }
  }

  setItemStatus(id: number, status: string): void {
    this.itemsService.setitemStatus(id, status);
  }

  rowExpanded(isExpanded: boolean, row: number): void {
    this.expandedRow = isExpanded ? row : null;
    if (isExpanded) {
      this.searchActivated(this.searchActivatedRow === row, row);
    }
  }

  searchActivated(isActivated: boolean, index: number | null): void {
    this.searchActivatedRow = isActivated ? index : null;
  }

  hoverSelectRow(i: number): void {
    this.selectedRow = i;
    this.hiddenCursor = false;
  }

  onSort(): void {
    this.clearExpandedRows();
    this.itemsService.loadItems(100, {});
  }

  onProductSelected(product: Product, id: number): void {
    ...
  }

  private clearExpandedRows(): void {
    this.searchActivatedRow = null;
    this.expandedRow = null;
  }

  private setTableColumns(): void {
    this.tableColumns = [
      {
        parentName: 'Name',
        width: '30%',
        columns: [
          {
            width: '25%',
            name: 'First name',
            field: 'firstName',
            sortable: true,
          },
          {
            width: '25%',
            name: 'Last name',
            field: 'lastName',
            sortable: true,
          },
          {
            width: '50%',
            name: 'date of birth',
            field: 'birthDate',
            sortable: false,
          },
        ],
      },
    ];
  }
}

const routesStateKey = makeStateKey<Routes>('ROUTES');

export interface Page {
  slug: string;
  type: PageTypesEnum;
  id: number;
}

// Please see https://github.com/Alex-hv/test-repo/blob/main/Honcharov_Oleksandr_attachment_CV_1.pdf 
// to have a better context of what this file is about

@Injectable()
export class AppInitializerService {

  private _pageTypesModules: Record<PageTypesEnum, () => Promise<Type<any>>> = {
    [PageTypeEnum.BLOG]: () => import('...')
      .then(({ BlogPageModule }) => BlogPageModule),
  };

  constructor(
    private _injector: Injector,
  ) {}

  public addDynamicRoutes(
    router: Router,
    transferState: TransferState,
    platform: PlatformParserService,
    pageInitializationService: PageInitializationService,
    appInjector: Injector,
  ): Promise<void> {
    return new Promise<void>(async (resolve) => {
      if (platform.isServer()) {
        const clientRoutes: Route[] = await pageInitializationService.getPages()
          .pipe(
            first(),
            tap((pages: Page[]) => transferState.set(routesStateKey, pages)),
            map((pages: Page[]) => this.getPageRoutes(pages, appInjector)),
          )
          .toPromise();

        this.appendRoutes(router, clientRoutes);
        router.initialNavigation();
        return resolve();
      }

      const routes: Route[] = this.getPageRoutes(transferState.get(routesStateKey, []), appInjector);

      this.appendRoutes(router, routes);
      resolve();
    });
  }

  private appendRoutes(router: Router, routes: Route[]): void {
    router.config = [...routes]
    router.resetConfig(router.config);
  }

  private getPageRoutes(pages: Page[], appInjector: Injector): Route[] {
    return pages.map((page: Page): Route => ({
      path: page.slug,
      loadChildren: this.processAddingChildRoutes(page, appInjector)(this._pageTypesModules[page.type]),
    }));
  }

  private processAddingChildRoutes<T>(page: Page, appInjector: Injector):
    (promise: () => Promise<Type<T>>) => () => Promise<LazyNgModuleWithProvidersFactory<T>> {
    return (promise: () => Promise<Type<T>>): () => Promise<LazyNgModuleWithProvidersFactory<T>> =>
      () => promise()
        .then((pageModule: any) =>
          pageModule.getChildRoutes(page, appInjector)
            .pipe(
              map((routes: Route[]) => new LazyNgModuleWithProvidersFactory<T>(
                pageModule.forChild(routes, page),
                PageToken,
              )),
            )
            .toPromise(),
        );
  }

}

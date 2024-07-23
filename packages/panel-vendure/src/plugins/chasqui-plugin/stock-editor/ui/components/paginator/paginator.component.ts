import { Input, Output, EventEmitter, Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'chq-paginator',
  templateUrl: './paginator.component.html',
  styleUrls: ['./paginator.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginatorComponent {
  @Input() currentPage: number;
  @Input() itemsPerPage: number;
  @Input() totalItems: number;
  @Output() pageChange = new EventEmitter<number>();

  get countPages() {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  get pages(): { label: string; value: number }[] {
    const p: { label: string; value: number }[] = [];
    const lastPage = this.countPages - 1;
    let i;

    if (lastPage < 7) {
      for (i = 0; i <= lastPage; i++) {
        p.push({ label: (i + 1).toString(), value: i });
      }
    } else if (this.currentPage < 4) {
      for (i = 0; i <= 4; i++) {
        p.push({ label: (i + 1).toString(), value: i });
      }
      p.push({ label: '...', value: i });
      p.push({ label: (lastPage + 1).toString(), value: lastPage });
    } else if (lastPage - this.currentPage < 6) {
      p.push({ label: '1', value: 0 });
      p.push({ label: '...', value: lastPage - 6 });
      for (i = lastPage - 4; i <= lastPage; i++) {
        p.push({ label: (i + 1).toString(), value: i });
      }
    } else {
      p.push({ label: '1', value: 0 });
      p.push({ label: '...', value: this.currentPage - 2 });
      p.push({ label: this.currentPage.toString(), value: this.currentPage - 1 });
      p.push({ label: (this.currentPage + 1).toString(), value: this.currentPage });
      p.push({ label: (this.currentPage + 2).toString(), value: this.currentPage + 1 });
      p.push({ label: '...', value: this.currentPage + 2 });
      p.push({ label: (lastPage + 1).toString(), value: lastPage });
    }
    return p;
  }

  isFirstPage() {
    return this.currentPage <= 0;
  }

  isLastPage() {
    return this.currentPage >= this.countPages - 1;
  }

  setCurrent(page: number) {
    this.pageChange.emit(page);
  }

  next() {
    this.pageChange.emit(this.currentPage + 1);
  }

  previous() {
    this.pageChange.emit(this.currentPage - 1);
  }
}

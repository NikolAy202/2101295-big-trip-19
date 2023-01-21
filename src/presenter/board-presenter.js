import ListPointsView from '../view/list-route-points';
import PointsListEmptyView from '../view/points-list-empty-view';
import FormSortView from '../view/form-sort-view';
import {render} from '../render.js';
import PointPresenter from './point-presenter';
import {updateItem} from '../utils/common.js';
import {SortType} from '../const/const';
import {sortByTime, sortByPrice, sortByDay} from '../utils/utils';


export default class BoardPresenter {
  #listPointsComponent = new ListPointsView();
  #pointsListEmptyView = new PointsListEmptyView();
  #sortComponent = null;
  #boardContainer = null;
  #pointsModel = null;
  #boardOffers = null;
  #destinations = null;
  #offersList = null;
  #offersListByType = null;
  #pointsPresenter = new Map();
  #currentSortType = SortType.DAY;
  #originalEventPoints = [];

  constructor({boardContainer, pointsModel}) {
    this.#boardContainer = boardContainer;
    this.#pointsModel = pointsModel;
  }

  get points() {
    switch (this.#currentSortType) {
      case SortType.DAY:
        return this.#boardOffers.sort(sortByDay);
      case SortType.TIME:
        return this.#boardOffers.sort(sortByTime);
      case SortType.PRICE:
        return this.#boardOffers.sort(sortByPrice);
    }
    return this.#pointsModel.points;
  }

  init() {
    this.#boardOffers = [...this.#pointsModel.points];
    this.#originalEventPoints = [...this.#pointsModel.points];
    this.#destinations = [...this.#pointsModel.destinations];
    this.#offersList = [...this.#pointsModel.offers];
    this.#offersListByType = [...this.#pointsModel.offersByType];
    this.#renderListPoints();
  }


  #handleModeChange = () => {
    this.#pointsPresenter.forEach((presenter) => presenter.resetView());
  };

  #renderEventsList(points) {
    render(this.#listPointsComponent, this.#boardContainer);

    points.forEach((point) => this.#renderRoutePoint({point, destinations: this.#destinations, offersList: this.#offersList, offersListByType: this.#offersListByType}));
  }

  #clearTaskList() {
    this.#pointsPresenter.forEach((presenter) => presenter.destroy());
    this.#pointsPresenter.clear();
  }

  #renderRoutePoint({point, destinations, offersList, offersListByType}) {
    const eventPointPresenter = new PointPresenter({listContainer: this.#listPointsComponent.element, onDataChange: this.#handlePointChange, onModeChange: this.#handleModeChange});
    eventPointPresenter.init(point, destinations, offersList, offersListByType);
    this.#pointsPresenter.set(point.id, eventPointPresenter);
  }

  #handlePointChange = (updatedPoint) => {
    this.#boardOffers = updateItem(this.#boardOffers, updatedPoint);
    this.#pointsPresenter.get(updatedPoint.id).init(updatedPoint, this.#destinations, this.#offersList, this.#offersListByType);
  };

  #handleSortTypeChange = (sortType)=>{
    if (this.#currentSortType === sortType) {
      return;
    }
    this.#currentSortType = sortType;
    this.#clearTaskList();
    this.#renderEventsList(this.points);
  };

  #renderSort() {
    this.#sortComponent = new FormSortView({
      onSortTypeChange: this.#handleSortTypeChange
    });
    render(this.#sortComponent, this.#boardContainer);
  }

  #renderListPoints() {
    render(this.#listPointsComponent, this.#boardContainer);
    if (!this.#pointsModel.points) {
      render(this.#pointsListEmptyView, this.#boardContainer);
    }
    this.#renderSort();
    //this.#sortWaypoints(this.#currentSortType);
    this.#renderEventsList(this.points);
  }
}

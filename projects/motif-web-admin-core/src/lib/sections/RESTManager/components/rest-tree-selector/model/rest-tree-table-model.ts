import { TreeNode } from "primeng/api";
import * as _uuidv1 from "uuid/v1";

const uuidv1 = _uuidv1;

export interface RESTEntry {
  path: string;
  name?: string;
}

export class RESTTreeTableModel {
  private _model: TreeNode[] = [];
  private _rootNode: TreeNode;

  constructor() {}

  public close() {
    this._model = null;
  }

  private buildNode(
    name: string,
    path: string,
    leaf?: boolean
  ): TreeNode {
    // Set the icon name
    let iconName = "pi-globe";

    return {
      data: {
        name: name,
        path: path,
        leaf: leaf,
        icon: "pi-bell",
        selectable: true,
        nodeIcon: iconName,
        nodeIconStyle: "color:blue;",
        id: uuidv1(),
        restEntry: {
          name: name ? name : null,
          path: path ? path : null
        }
      },
      expanded: true,
      children: []
    };
  }

  private rebuildModel(serviceCatalog: any): void {
    const tempModel = [];

    this._rootNode = this.buildNode("","rest", false);

    //TODO!!

    tempModel.push(this._rootNode);

    this._model = tempModel;
  }

  public loadData(restTree: any) {
    this.rebuildModel(restTree);
    console.log("loadData called for ", restTree);
    console.log("loadData done.Model is ", this._model);
  }

  public get model(): TreeNode[] {
    return this._model;
  }
}

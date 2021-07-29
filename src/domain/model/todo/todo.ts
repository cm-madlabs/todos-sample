import {TodoId} from './todoId';
import {TodoText} from './todoText';

export class Todo {
  private readonly id: TodoId;
  private text: TodoText;
  private checked: boolean;

  constructor(props: {id: TodoId; text: TodoText}) {
    this.id = props.id;
    this.text = props.text;
    this.checked = false;
  }

  changeText = (text: TodoText) => {
    this.text = text;
  };

  check = () => {
    this.checked = true;
  };

  unCheck = () => {
    this.checked = false;
  };

  getId = () => this.id;

  getText = () => this.text;

  getChecked = () => this.checked;
}

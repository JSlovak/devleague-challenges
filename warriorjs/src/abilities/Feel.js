import Base from './Base';

class Feel extends Base {
  getDescription() {
    return 'Returns a Space for the given direction (forward by default).';
  }

  perform(direction = 'forward') {
    this.verifyDirection(direction);
    return this.getSpace(direction).getPlayerObject();
  }
}

export default Feel;

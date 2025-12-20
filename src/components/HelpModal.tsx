import React from 'react';
import './HelpModal.css';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="help-modal-overlay" onClick={onClose}>
      <div className="help-modal" onClick={(e) => e.stopPropagation()}>
        <div className="help-header">
          <h2>ゲームガイド</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="help-content">
          <section className="help-section">
            <h3>ゲーム目標</h3>
            <p>30ターン生き残りましょう！需要拠点（日本の都市）の在庫が0になるとゲームオーバーです。</p>
          </section>

          <section className="help-section">
            <h3>基本操作</h3>
            <div className="help-item">
              <span className="help-icon">1</span>
              <div>
                <strong>貨物を積む</strong>
                <p>供給拠点（灰色の港）で、港の在庫をクリックして船に積み込みます。</p>
              </div>
            </div>
            <div className="help-item">
              <span className="help-icon">2</span>
              <div>
                <strong>出港する</strong>
                <p>緑にハイライトされた拠点をクリックして出港します。</p>
              </div>
            </div>
            <div className="help-item">
              <span className="help-icon">3</span>
              <div>
                <strong>荷下ろし</strong>
                <p>需要拠点（色付きの港）で「荷下ろし」ボタンを押して貨物を届けます。</p>
              </div>
            </div>
          </section>

          <section className="help-section">
            <h3>船の種類</h3>
            <div className="ship-types">
              <div className="ship-type">
                <span className="ship-emoji">🚢</span>
                <div>
                  <strong>大型船</strong>
                  <p>積載24個 / 1色のみ / 速度1</p>
                </div>
              </div>
              <div className="ship-type">
                <span className="ship-emoji">⛵</span>
                <div>
                  <strong>中型船</strong>
                  <p>積載18個 / 2色まで / 速度2</p>
                </div>
              </div>
              <div className="ship-type">
                <span className="ship-emoji">🛥️</span>
                <div>
                  <strong>小型船</strong>
                  <p>積載12個 / 1色のみ / 速度3</p>
                </div>
              </div>
            </div>
          </section>

          <section className="help-section">
            <h3>拠点の種類</h3>
            <div className="port-types">
              <div className="port-type">
                <div className="port-icon demand"></div>
                <div>
                  <strong>需要拠点（日本の都市）</strong>
                  <p>毎ターン在庫が消費されます。対応する色の貨物を届けて補充しましょう。</p>
                </div>
              </div>
              <div className="port-type">
                <div className="port-icon supply"></div>
                <div>
                  <strong>供給拠点（海外）</strong>
                  <p>毎ターン貨物が生成されます。ここで貨物を積み込みます。</p>
                </div>
              </div>
            </div>
          </section>

          <section className="help-section">
            <h3>アイテム</h3>
            <div className="help-items-list">
              <div className="help-item-row">
                <span>📦 緊急生産</span>
                <p>供給拠点1つの在庫を満タンにします</p>
              </div>
              <div className="help-item-row">
                <span>❄️ 特別休日</span>
                <p>1ターン、全都市の消費を停止します</p>
              </div>
              <div className="help-item-row">
                <span>⚡ 瞬間移動</span>
                <p>船1隻を任意の港へ即座に移動します</p>
              </div>
            </div>
          </section>

          <section className="help-section">
            <h3>スコア</h3>
            <p>需要拠点に届けた貨物の合計個数がスコアになります。より多くの貨物を届けてハイスコアを目指しましょう！</p>
          </section>

          <section className="help-section">
            <h3>難易度</h3>
            <p>ターン経過で需要レベルが上昇し、都市の消費量が増加します。</p>
            <ul>
              <li><strong>Lv1（T1-10）:</strong> 赤青-2、黄緑-1</li>
              <li><strong>Lv2（T11-20）:</strong> 赤青-3、黄緑-2</li>
              <li><strong>Lv3（T21-30）:</strong> 赤青-4、黄緑-3</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
};

import { RawMaterial, Blank, Movement, ModalType, StockItem } from "./warehouse.types";
import {
  ModalIn, ModalCut, ModalUseAny,
  ModalMaterial,
} from "./WarehouseModals";
import type { UseAnyPayload } from "./WarehouseModals";
import MovementHistoryPanel from "./MovementHistoryPanel";
import { ModalAddMaterial } from "./ModalAddMaterial";

type Props = {
  modal: ModalType;
  rawMat: RawMaterial[];
  blanks: Blank[];
  stock: StockItem[];
  movements: Movement[];
  matDetail: RawMaterial | null;
  showAddMat: boolean;
  showHistory: boolean;

  inRawId: string;     setInRawId: (v: string) => void;
  inQty: string;       setInQty: (v: string) => void;
  inReceiptId: string; setInReceiptId: (v: string) => void;
  inPrice: string;     setInPrice: (v: string) => void;

  cutRawId: string;    setCutRawId: (v: string) => void;
  cutBlankId: string;  setCutBlankId: (v: string) => void;
  cutQty: string;      setCutQty: (v: string) => void;
  cutRawPer: string;   setCutRawPer: (v: string) => void;
  cutDeadline: string; setCutDeadline: (v: string) => void;

  onConfirmIn: () => void;
  onConfirmCut: () => void;
  onConfirmUse: (p: UseAnyPayload) => void;
  onCloseModal: () => void;
  onCloseMatDetail: () => void;
  onCloseAddMat: () => void;
  onCloseHistory: () => void;
  onAddMat: (mat: RawMaterial) => void;
};

export default function WarehouseModalsGroup({
  modal, rawMat, blanks, stock, movements, matDetail, showAddMat, showHistory,
  inRawId, setInRawId, inQty, setInQty, inReceiptId, setInReceiptId, inPrice, setInPrice,
  cutRawId, setCutRawId, cutBlankId, setCutBlankId,
  cutQty, setCutQty, cutRawPer, setCutRawPer, cutDeadline, setCutDeadline,
  onConfirmIn, onConfirmCut, onConfirmUse,
  onCloseModal, onCloseMatDetail, onCloseAddMat, onCloseHistory,
  onAddMat,
}: Props) {
  return (
    <>
      {modal === "in" && (
        <ModalIn
          rawMat={rawMat}
          inRawId={inRawId}         setInRawId={setInRawId}
          inQty={inQty}             setInQty={setInQty}
          inReceiptId={inReceiptId} setInReceiptId={setInReceiptId}
          inPrice={inPrice}         setInPrice={setInPrice}
          onConfirm={onConfirmIn}
          onClose={onCloseModal}
        />
      )}

      {modal === "cut" && (
        <ModalCut
          rawMat={rawMat} blanks={blanks}
          cutRawId={cutRawId}       setCutRawId={setCutRawId}
          cutBlankId={cutBlankId}   setCutBlankId={setCutBlankId}
          cutQty={cutQty}           setCutQty={setCutQty}
          cutRawPer={cutRawPer}     setCutRawPer={setCutRawPer}
          cutDeadline={cutDeadline} setCutDeadline={setCutDeadline}
          onConfirm={onConfirmCut}
          onClose={onCloseModal}
        />
      )}

      {modal === "use" && (
        <ModalUseAny
          rawMat={rawMat}
          blanks={blanks}
          stock={stock}
          onConfirm={onConfirmUse}
          onClose={onCloseModal}
        />
      )}

      {matDetail && (
        <ModalMaterial
          material={matDetail}
          movements={movements}
          onClose={onCloseMatDetail}
        />
      )}

      {showAddMat && (
        <ModalAddMaterial
          onClose={onCloseAddMat}
          onAdd={onAddMat}
        />
      )}

      {showHistory && (
        <MovementHistoryPanel
          movements={movements}
          rawMat={rawMat}
          blanks={blanks}
          onClose={onCloseHistory}
        />
      )}
    </>
  );
}
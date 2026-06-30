import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import {
  StyleSheet,
  View,
  Platform,
  TouchableOpacity,
  Text,
  ScrollView,
  useWindowDimensions,
  Alert,
  ActivityIndicator,
} from "react-native";
import {
  downloadInsuranceClaim,
  generateInsuranceFormHTML,
} from "../../utils/CareHealthPreAuth";
//import { mapToFormB } from "../../utils/CareHealthMapper";
import { mapToCareHealthPreAuth } from "../../utils/CareHealthPreAuthMapper";
import { Ionicons } from "@expo/vector-icons";

/**
 * StarHealthPreAuth
 * Layout: form preview (left, flex:1) | buttons panel (right, fixed width)
 * No outer shell — designed to be embedded directly in PARequests Step 5.
 */
export default function StarHealthPreAuth({ navigation, route }) {
  const analysisData = route?.params?.analysisData;
  const { width } = useWindowDimensions();
  const isMobile = width < 1000;

  console.log("analysisData", analysisData);

  // const formSeed = useMemo(() => {
  //   const data = mapToFormB(analysisData);
  //   console.log("Mapped Data", data);
  //   return data;
  // }, [analysisData]);
  const formSeed = useMemo(() => {
    const data = mapToCareHealthPreAuth(analysisData);
    console.log("Mapped Data", data);
    return data;
  }, [analysisData]);

  const [form, setForm] = useState(() => formSeed);
  const [isDownloading, setIsDownloading] = useState(false);
  const [previewMode, setPreviewMode] = useState(true);
  const [signatureImage, setSignatureImage] = useState(null);

  const previewFrameRef = useRef(null);
  const [previewFrameHeight, setPreviewFrameHeight] = useState(1400);
  const [editedHtml, setEditedHtml] = useState(null);
  const [editZoom, setEditZoom] = useState(1.3);

  // Add this ref at the top with other refs
  const editFrameRef = useRef(null);
  const htmlPreview = useMemo(() => {
    // console.log("form for HTML generation:", form);
    // console.log("signatureImage for HTML generation:", signatureImage);
    return generateInsuranceFormHTML(form, signatureImage);
  }, [form, signatureImage]);

  const editableHtml = useMemo(() => {
    if (!htmlPreview) return htmlPreview;

    const zoomStyle = `<style id="__edit_zoom_style__">html { zoom: 1.3; }</style>`;

    const script = `<script>
(function() {
  function setup() {
    // CHAR BOXES
    document.querySelectorAll('.char-row').forEach(function(row) {
      var boxes = row.querySelectorAll('.char-box');
      boxes.forEach(function(box, idx) {
        box.setAttribute('contenteditable', 'true');
        box.setAttribute('tabindex', '0');
        box.style.cursor = 'text';
        box.style.outline = '2px solid transparent';
        box.style.transition = 'outline 0.1s';
        box.style.caretColor = 'transparent';
        box.style.userSelect = 'none';
        box.addEventListener('focus', function() {
          box.style.outline = '2px solid #1565C0';
          box.style.background = '#EEF4FF';
        });
        box.addEventListener('blur', function() {
          box.style.outline = '2px solid transparent';
          box.style.background = '#fff';
        });
        box.addEventListener('keydown', function(e) {
          e.preventDefault();
          if (e.key === 'Backspace' || e.key === 'Delete') {
            box.textContent = '';
            if (idx > 0) boxes[idx - 1].focus();
          } else if (e.key === 'ArrowLeft') {
            if (idx > 0) boxes[idx - 1].focus();
          } else if (e.key === 'ArrowRight') {
            if (idx < boxes.length - 1) boxes[idx + 1].focus();
          } else if (e.key.length === 1) {
            box.textContent = e.key.toUpperCase();
            if (idx < boxes.length - 1) boxes[idx + 1].focus();
          }
        });
        box.addEventListener('click', function() { box.focus(); });
      });
    });

    // SQUARE-BOX / GENDER-BOX
    document.querySelectorAll('.square-box, .gender-box').forEach(function(box) {
      box.style.cursor = 'pointer';
      box.style.display = 'inline-flex';
      box.style.alignItems = 'center';
      box.style.justifyContent = 'center';
      box.style.flexShrink = '0';
      box.dataset.checked = '0';
      box.addEventListener('click', function(e) {
        e.stopPropagation();
        if (box.dataset.checked === '1') {
          box.dataset.checked = '0';
          box.style.background = '#fff';
          box.textContent = '';
        } else {
          box.dataset.checked = '1';
          box.style.background = '#1565C0';
          box.style.color = '#fff';
          box.style.fontSize = '14px';
          box.textContent = '✓';
        }
      });
    });

    // CB CHECKBOXES
    document.querySelectorAll('.cb').forEach(function(box) {
      box.style.cursor = 'pointer';
      box.style.display = 'inline-flex';
      box.style.alignItems = 'center';
      box.style.justifyContent = 'center';
      box.dataset.checked = box.classList.contains('cb-checked') ? '1' : '0';
      box.addEventListener('click', function(e) {
        e.stopPropagation();
        if (box.dataset.checked === '1') {
          box.dataset.checked = '0';
          box.style.background = '#fff';
          box.style.color = '#111';
          box.textContent = '';
        } else {
          box.dataset.checked = '1';
          box.style.background = '#1565C0';
          box.style.color = '#fff';
          box.style.fontSize = '10px';
          box.textContent = '✓';
        }
      });
    });

    // LINE FIELDS
    document.querySelectorAll('.treating-line, .details-line, .room-line, .other-ailment-line').forEach(function(el) {
      el.setAttribute('contenteditable', 'true');
      el.style.cursor = 'text';
      el.style.outline = 'none';
      el.style.minWidth = '60px';
      el.style.color = '#111';
      el.style.fontSize = '8px';
      el.style.padding = '1px 2px';
      el.style.borderBottom = '1px solid #555';
    });

    document.querySelectorAll('.line-field').forEach(function(el) {
      el.setAttribute('contenteditable', 'true');
      el.style.cursor = 'text';
      el.style.outline = 'none';
      el.style.color = '#111';
    });

    document.querySelectorAll('.section-e-line-input, .section-e-sign-line, .section-e-small-line, .section-f-line-input').forEach(function(el) {
      el.setAttribute('contenteditable', 'true');
      el.style.cursor = 'text';
      el.style.outline = 'none';
      el.style.color = '#111';
      el.style.fontSize = '9px';
      el.style.minHeight = '14px';
      el.style.display = 'inline-block';
    });

    // SIGNATURE CANVASES
    document.querySelectorAll('.section-d-sign-box, .section-f-box, .signature-box, .signature-box-filled').forEach(function(box) {
      box.style.position = 'relative';
      box.style.cursor = 'crosshair';
      var canvas = document.createElement('canvas');
      var w = box.offsetWidth || 245;
      var h = box.offsetHeight || 78;
      canvas.width = w * 2;
      canvas.height = h * 2;
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      canvas.style.display = 'block';
      canvas.style.position = 'absolute';
      canvas.style.top = '0';
      canvas.style.left = '0';
      box.style.overflow = 'hidden';
      box.appendChild(canvas);
      var ctx = canvas.getContext('2d');
      ctx.scale(2, 2);
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 1.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      var drawing = false;
      var lastX = 0, lastY = 0;
      function getPos(e) {
        var rect = canvas.getBoundingClientRect();
        var src = e.touches ? e.touches[0] : e;
        return [(src.clientX - rect.left) * (canvas.width / 2 / rect.width), (src.clientY - rect.top) * (canvas.height / 2 / rect.height)];
      }
      canvas.addEventListener('mousedown', function(e) { e.preventDefault(); drawing = true; var pos = getPos(e); lastX = pos[0]; lastY = pos[1]; });
      canvas.addEventListener('mousemove', function(e) { e.preventDefault(); if (!drawing) return; var pos = getPos(e); ctx.beginPath(); ctx.moveTo(lastX, lastY); ctx.lineTo(pos[0], pos[1]); ctx.stroke(); lastX = pos[0]; lastY = pos[1]; });
      canvas.addEventListener('mouseup', function() { drawing = false; });
      canvas.addEventListener('mouseleave', function() { drawing = false; });
      canvas.addEventListener('dblclick', function() { ctx.clearRect(0, 0, canvas.width / 2, canvas.height / 2); });
      var hint = document.createElement('div');
      hint.textContent = 'Sign here | Dbl-click to clear';
      hint.style.cssText = 'position:absolute;bottom:2px;right:4px;font-size:7px;color:#bbb;pointer-events:none;z-index:1;';
      box.appendChild(hint);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setup);
  } else {
    setup();
  }
})();
<\/script>`;

    return htmlPreview
      .replace("</head>", zoomStyle + "</head>")
      .replace("</body>", script + "</body>");
  }, [htmlPreview]);

  // const injectEditableScript = useCallback(() => {
  //   if (Platform.OS !== "web") return;
  //   const iframe = editFrameRef.current;
  //   if (!iframe) return;
  //   const doc = iframe?.contentWindow?.document;
  //   if (!doc) return;

  //   const script = doc.createElement("script");
  //   script.textContent = `
  //   (function() {
  //     // ── CHAR BOXES ──
  //     document.querySelectorAll('.char-row').forEach(function(row) {
  //       var boxes = row.querySelectorAll('.char-box');
  //       boxes.forEach(function(box, idx) {
  //         box.setAttribute('contenteditable', 'true');
  //         box.setAttribute('tabindex', '0');
  //         box.style.cursor = 'text';
  //         box.style.outline = '2px solid transparent';
  //         box.style.transition = 'outline 0.1s';
  //         box.style.caretColor = 'transparent';
  //         box.style.userSelect = 'none';

  //         box.addEventListener('focus', function() {
  //           box.style.outline = '2px solid #1565C0';
  //           box.style.background = '#EEF4FF';
  //         });
  //         box.addEventListener('blur', function() {
  //           box.style.outline = '2px solid transparent';
  //           box.style.background = '#fff';
  //         });

  //         box.addEventListener('keydown', function(e) {
  //           e.preventDefault();
  //           if (e.key === 'Backspace' || e.key === 'Delete') {
  //             box.textContent = '';
  //             if (idx > 0) boxes[idx - 1].focus();
  //           } else if (e.key === 'ArrowLeft') {
  //             if (idx > 0) boxes[idx - 1].focus();
  //           } else if (e.key === 'ArrowRight') {
  //             if (idx < boxes.length - 1) boxes[idx + 1].focus();
  //           } else if (e.key === 'Tab') {
  //             // do nothing, let browser handle
  //           } else if (e.key.length === 1) {
  //             box.textContent = e.key.toUpperCase();
  //             if (idx < boxes.length - 1) boxes[idx + 1].focus();
  //           }
  //         });

  //         // Click to focus
  //         box.addEventListener('click', function() {
  //           box.focus();
  //         });
  //       });
  //     });

  //     // ── CHECKBOXES (square-box) ──
  //     document.querySelectorAll('.square-box, .gender-box').forEach(function(box) {
  //       box.style.cursor = 'pointer';
  //       box.style.display = 'inline-flex';
  //       box.style.alignItems = 'center';
  //       box.style.justifyContent = 'center';
  //       box.style.flexShrink = '0';
  //       box.style.transition = 'background 0.15s';
  //       box.dataset.checked = '0';

  //       box.addEventListener('click', function(e) {
  //         e.stopPropagation();
  //         if (box.dataset.checked === '1') {
  //           box.dataset.checked = '0';
  //           box.style.background = '#fff';
  //           box.textContent = '';
  //         } else {
  //           box.dataset.checked = '1';
  //           box.style.background = '#1565C0';
  //           box.style.color = '#fff';
  //           box.style.fontSize = '14px';
  //           box.textContent = '✓';
  //         }
  //       });
  //     });

  //     // ── CB CHECKBOXES ──
  //     document.querySelectorAll('.cb').forEach(function(box) {
  //       box.style.cursor = 'pointer';
  //       box.style.display = 'inline-flex';
  //       box.style.alignItems = 'center';
  //       box.style.justifyContent = 'center';
  //       box.style.transition = 'background 0.15s';
  //       box.dataset.checked = box.classList.contains('cb-checked') ? '1' : '0';

  //       box.addEventListener('click', function(e) {
  //         e.stopPropagation();
  //         if (box.dataset.checked === '1') {
  //           box.dataset.checked = '0';
  //           box.style.background = '#fff';
  //           box.style.color = '#111';
  //           box.textContent = '';
  //         } else {
  //           box.dataset.checked = '1';
  //           box.style.background = '#1565C0';
  //           box.style.color = '#fff';
  //           box.style.fontSize = '10px';
  //           box.textContent = '✓';
  //         }
  //       });
  //     });

  //     // ── GENDER / OPTION BOXES (square-box inside option groups) ──
  //     // Already handled above

  //     // ── LINE FIELDS (underline text fields) ──
  //     document.querySelectorAll('.treating-line, .details-line, .room-line, .other-ailment-line').forEach(function(el) {
  //       el.setAttribute('contenteditable', 'true');
  //       el.style.cursor = 'text';
  //       el.style.outline = 'none';
  //       el.style.minWidth = '60px';
  //       el.style.color = '#111';
  //       el.style.fontSize = '8px';
  //       el.style.padding = '1px 2px';
  //       el.style.borderBottom = '1px solid #555';
  //     });

  //     document.querySelectorAll('.line-field').forEach(function(el) {
  //       el.setAttribute('contenteditable', 'true');
  //       el.style.cursor = 'text';
  //       el.style.outline = 'none';
  //       el.style.color = '#111';
  //     });

  //     // ── SECTION E lines ──
  //     document.querySelectorAll('.section-e-line-input, .section-e-sign-line, .section-e-small-line, .section-f-line-input').forEach(function(el) {
  //       el.setAttribute('contenteditable', 'true');
  //       el.style.cursor = 'text';
  //       el.style.outline = 'none';
  //       el.style.color = '#111';
  //       el.style.fontSize = '9px';
  //       el.style.minHeight = '14px';
  //       el.style.display = 'inline-block';
  //     });

  //     // ── SIGNATURE CANVASES ──
  //     document.querySelectorAll('.section-d-sign-box, .section-f-box, .signature-box, .signature-box-filled').forEach(function(box) {
  //       box.style.position = 'relative';
  //       box.style.cursor = 'crosshair';

  //       var canvas = document.createElement('canvas');
  //       var w = box.offsetWidth || 245;
  //       var h = box.offsetHeight || 78;
  //       canvas.width = w * 2;
  //       canvas.height = h * 2;
  //       canvas.style.width = '100%';
  //       canvas.style.height = '100%';
  //       canvas.style.display = 'block';
  //       canvas.style.position = 'absolute';
  //       canvas.style.top = '0';
  //       canvas.style.left = '0';
  //       box.style.overflow = 'hidden';
  //       box.appendChild(canvas);

  //       var ctx = canvas.getContext('2d');
  //       ctx.scale(2, 2);
  //       ctx.strokeStyle = '#000';
  //       ctx.lineWidth = 1.5;
  //       ctx.lineCap = 'round';
  //       ctx.lineJoin = 'round';

  //       var drawing = false;
  //       var lastX = 0, lastY = 0;

  //       function getPos(e) {
  //         var rect = canvas.getBoundingClientRect();
  //         var src = e.touches ? e.touches[0] : e;
  //         return [
  //           (src.clientX - rect.left) * (canvas.width / 2 / rect.width),
  //           (src.clientY - rect.top) * (canvas.height / 2 / rect.height)
  //         ];
  //       }

  //       canvas.addEventListener('mousedown', function(e) {
  //         e.preventDefault();
  //         drawing = true;
  //         var pos = getPos(e);
  //         lastX = pos[0]; lastY = pos[1];
  //       });
  //       canvas.addEventListener('mousemove', function(e) {
  //         e.preventDefault();
  //         if (!drawing) return;
  //         var pos = getPos(e);
  //         ctx.beginPath();
  //         ctx.moveTo(lastX, lastY);
  //         ctx.lineTo(pos[0], pos[1]);
  //         ctx.stroke();
  //         lastX = pos[0]; lastY = pos[1];
  //       });
  //       canvas.addEventListener('mouseup', function() { drawing = false; });
  //       canvas.addEventListener('mouseleave', function() { drawing = false; });

  //       // Touch support
  //       canvas.addEventListener('touchstart', function(e) {
  //         e.preventDefault();
  //         drawing = true;
  //         var pos = getPos(e);
  //         lastX = pos[0]; lastY = pos[1];
  //       }, { passive: false });
  //       canvas.addEventListener('touchmove', function(e) {
  //         e.preventDefault();
  //         if (!drawing) return;
  //         var pos = getPos(e);
  //         ctx.beginPath();
  //         ctx.moveTo(lastX, lastY);
  //         ctx.lineTo(pos[0], pos[1]);
  //         ctx.stroke();
  //         lastX = pos[0]; lastY = pos[1];
  //       }, { passive: false });
  //       canvas.addEventListener('touchend', function() { drawing = false; });

  //       // Double click to clear
  //       canvas.addEventListener('dblclick', function() {
  //         ctx.clearRect(0, 0, canvas.width / 2, canvas.height / 2);
  //       });

  //       // Add clear hint
  //       var hint = document.createElement('div');
  //       hint.textContent = 'Sign here  |  Dbl-click to clear';
  //       hint.style.cssText = 'position:absolute;bottom:2px;right:4px;font-size:7px;color:#bbb;pointer-events:none;z-index:1;';
  //       box.appendChild(hint);
  //     });

  //     console.log('Editable setup complete');
  //   })();
  // `;
  //   doc.body.appendChild(script);
  // }, []);

  // const injectEditableScript = useCallback(() => {
  //   if (Platform.OS !== "web") return;

  //   const iframe = editFrameRef.current;
  //   if (!iframe) return;

  //   const doc = iframe.contentDocument;
  //   if (!doc) return;

  //   doc.querySelectorAll("div").forEach((el) => {
  //     const cls = String(el.className || "");

  //     if (
  //       cls.includes("box") ||
  //       cls.includes("input") ||
  //       cls.includes("line")
  //     ) {
  //       el.contentEditable = true;
  //       el.style.cursor = "text";
  //       el.style.pointerEvents = "auto";
  //       el.style.outline = "none";

  //       el.addEventListener("focus", () => {
  //         el.style.outline = "2px solid #1976D2";
  //       });

  //       el.addEventListener("blur", () => {
  //         el.style.outline = "none";
  //       });
  //     }
  //   });
  // }, []);
  const injectEditableScript = useCallback(() => {
    if (Platform.OS !== "web") return;
    const iframe = editFrameRef.current;
    if (!iframe) return;
    const doc = iframe?.contentWindow?.document;
    if (!doc) return;

    const script = doc.createElement("script");
    script.textContent = `
  (function() {
    // ── CHAR BOXES ──
    document.querySelectorAll('.char-row').forEach(function(row) {
      var boxes = row.querySelectorAll('.char-box');
      boxes.forEach(function(box, idx) {
        box.setAttribute('contenteditable', 'true');
        box.setAttribute('tabindex', '0');
        box.style.cursor = 'text';
        box.style.outline = '2px solid transparent';
        box.style.transition = 'outline 0.1s';
        box.style.caretColor = 'transparent';
        box.style.userSelect = 'none';

        box.addEventListener('focus', function() {
          box.style.outline = '2px solid #1565C0';
          box.style.background = '#EEF4FF';
        });
        box.addEventListener('blur', function() {
          box.style.outline = '2px solid transparent';
          box.style.background = '#fff';
        });

        box.addEventListener('keydown', function(e) {
          e.preventDefault();
          if (e.key === 'Backspace' || e.key === 'Delete') {
            box.textContent = '';
            if (idx > 0) boxes[idx - 1].focus();
          } else if (e.key === 'ArrowLeft') {
            if (idx > 0) boxes[idx - 1].focus();
          } else if (e.key === 'ArrowRight') {
            if (idx < boxes.length - 1) boxes[idx + 1].focus();
          } else if (e.key.length === 1) {
            box.textContent = e.key.toUpperCase();
            if (idx < boxes.length - 1) boxes[idx + 1].focus();
          }
        });

        box.addEventListener('click', function() { box.focus(); });
      });
    });

    // ── SQUARE-BOX / GENDER-BOX CHECKBOXES ──
    document.querySelectorAll('.square-box, .gender-box').forEach(function(box) {
      box.style.cursor = 'pointer';
      box.style.display = 'inline-flex';
      box.style.alignItems = 'center';
      box.style.justifyContent = 'center';
      box.style.flexShrink = '0';
      box.style.transition = 'background 0.15s';
      box.dataset.checked = '0';

      box.addEventListener('click', function(e) {
        e.stopPropagation();
        if (box.dataset.checked === '1') {
          box.dataset.checked = '0';
          box.style.background = '#fff';
          box.textContent = '';
        } else {
          box.dataset.checked = '1';
          box.style.background = '#1565C0';
          box.style.color = '#fff';
          box.style.fontSize = '14px';
          box.textContent = '✓';
        }
      });
    });

    // ── CB CHECKBOXES ──
    document.querySelectorAll('.cb').forEach(function(box) {
      box.style.cursor = 'pointer';
      box.style.display = 'inline-flex';
      box.style.alignItems = 'center';
      box.style.justifyContent = 'center';
      box.style.transition = 'background 0.15s';
      box.dataset.checked = box.classList.contains('cb-checked') ? '1' : '0';

      box.addEventListener('click', function(e) {
        e.stopPropagation();
        if (box.dataset.checked === '1') {
          box.dataset.checked = '0';
          box.style.background = '#fff';
          box.style.color = '#111';
          box.textContent = '';
        } else {
          box.dataset.checked = '1';
          box.style.background = '#1565C0';
          box.style.color = '#fff';
          box.style.fontSize = '10px';
          box.textContent = '✓';
        }
      });
    });

    // ── LINE FIELDS ──
    document.querySelectorAll(
      '.treating-line, .details-line, .room-line, .other-ailment-line'
    ).forEach(function(el) {
      el.setAttribute('contenteditable', 'true');
      el.style.cursor = 'text';
      el.style.outline = 'none';
      el.style.minWidth = '60px';
      el.style.color = '#111';
      el.style.fontSize = '8px';
      el.style.padding = '1px 2px';
      el.style.borderBottom = '1px solid #555';
    });

    document.querySelectorAll('.line-field').forEach(function(el) {
      el.setAttribute('contenteditable', 'true');
      el.style.cursor = 'text';
      el.style.outline = 'none';
      el.style.color = '#111';
    });

    // ── SECTION E / F LINES ──
    document.querySelectorAll(
      '.section-e-line-input, .section-e-sign-line, .section-e-small-line, .section-f-line-input'
    ).forEach(function(el) {
      el.setAttribute('contenteditable', 'true');
      el.style.cursor = 'text';
      el.style.outline = 'none';
      el.style.color = '#111';
      el.style.fontSize = '9px';
      el.style.minHeight = '14px';
      el.style.display = 'inline-block';
    });

    // ── SIGNATURE CANVASES ──
    document.querySelectorAll(
      '.section-d-sign-box, .section-f-box, .signature-box, .signature-box-filled'
    ).forEach(function(box) {
      box.style.position = 'relative';
      box.style.cursor = 'crosshair';

      var canvas = document.createElement('canvas');
      var w = box.offsetWidth || 245;
      var h = box.offsetHeight || 78;
      canvas.width = w * 2;
      canvas.height = h * 2;
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      canvas.style.display = 'block';
      canvas.style.position = 'absolute';
      canvas.style.top = '0';
      canvas.style.left = '0';
      box.style.overflow = 'hidden';
      box.appendChild(canvas);

      var ctx = canvas.getContext('2d');
      ctx.scale(2, 2);
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 1.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      var drawing = false;
      var lastX = 0, lastY = 0;

      function getPos(e) {
        var rect = canvas.getBoundingClientRect();
        var src = e.touches ? e.touches[0] : e;
        return [
          (src.clientX - rect.left) * (canvas.width / 2 / rect.width),
          (src.clientY - rect.top) * (canvas.height / 2 / rect.height)
        ];
      }

      canvas.addEventListener('mousedown', function(e) {
        e.preventDefault(); drawing = true;
        var pos = getPos(e); lastX = pos[0]; lastY = pos[1];
      });
      canvas.addEventListener('mousemove', function(e) {
        e.preventDefault();
        if (!drawing) return;
        var pos = getPos(e);
        ctx.beginPath(); ctx.moveTo(lastX, lastY);
        ctx.lineTo(pos[0], pos[1]); ctx.stroke();
        lastX = pos[0]; lastY = pos[1];
      });
      canvas.addEventListener('mouseup', function() { drawing = false; });
      canvas.addEventListener('mouseleave', function() { drawing = false; });
      canvas.addEventListener('touchstart', function(e) {
        e.preventDefault(); drawing = true;
        var pos = getPos(e); lastX = pos[0]; lastY = pos[1];
      }, { passive: false });
      canvas.addEventListener('touchmove', function(e) {
        e.preventDefault();
        if (!drawing) return;
        var pos = getPos(e);
        ctx.beginPath(); ctx.moveTo(lastX, lastY);
        ctx.lineTo(pos[0], pos[1]); ctx.stroke();
        lastX = pos[0]; lastY = pos[1];
      }, { passive: false });
      canvas.addEventListener('touchend', function() { drawing = false; });
      canvas.addEventListener('dblclick', function() {
        ctx.clearRect(0, 0, canvas.width / 2, canvas.height / 2);
      });

      var hint = document.createElement('div');
      hint.textContent = 'Sign here  |  Dbl-click to clear';
      hint.style.cssText = 'position:absolute;bottom:2px;right:4px;font-size:7px;color:#bbb;pointer-events:none;z-index:1;';
      box.appendChild(hint);
    });

    console.log('Care Health edit setup complete');
  })();
  `;
    doc.body.appendChild(script);
  }, []);

  const applyZoom = useCallback((zoomValue) => {
    if (Platform.OS !== "web") return;
    const doc = editFrameRef.current?.contentWindow?.document;
    if (!doc) return;
    let style = doc.getElementById("__edit_zoom_style__");
    if (!style) {
      style = doc.createElement("style");
      style.id = "__edit_zoom_style__";
      doc.head.appendChild(style);
    }
    style.textContent = `html { zoom: ${zoomValue}; }`;
  }, []);

  useEffect(() => {
    setForm(formSeed);
  }, [formSeed]);
  useEffect(() => {
    setEditedHtml(null);
  }, [formSeed]);

  // const syncPreviewFrameHeight = useCallback(() => {
  //   if (Platform.OS !== "web") return;
  //   const iframe = previewFrameRef.current;
  //   const doc = iframe?.contentWindow?.document;
  //   if (!doc) return;
  //   const body = doc.body;
  //   const root = doc.documentElement;
  //   const nextHeight = Math.max(
  //     body?.scrollHeight || 0,
  //     body?.offsetHeight || 0,
  //     root?.scrollHeight || 0,
  //     root?.offsetHeight || 0,
  //   );
  //   if (nextHeight > 0) {
  //     setPreviewFrameHeight(Math.max(900, Math.ceil(nextHeight) + 20));
  //   }
  // }, []);
  // ✅ Fix syncPreviewFrameHeight to handle BOTH refs
  const syncPreviewFrameHeight = useCallback(() => {
    if (Platform.OS !== "web") return;

    // Use whichever iframe is currently active
    const iframe = previewMode ? previewFrameRef.current : editFrameRef.current;

    const doc = iframe?.contentWindow?.document;
    if (!doc) return;
    const body = doc.body;
    const root = doc.documentElement;
    const nextHeight = Math.max(
      body?.scrollHeight || 0,
      body?.offsetHeight || 0,
      root?.scrollHeight || 0,
      root?.offsetHeight || 0,
    );
    if (nextHeight > 0) {
      setPreviewFrameHeight(Math.max(900, Math.ceil(nextHeight) + 20));
    }
  }, [previewMode]); // add previewMode as dep

  useEffect(() => {
    if (Platform.OS !== "web" || !previewMode) return;
    console.log("yaha pahuch gye h1");
    const timer = setTimeout(syncPreviewFrameHeight, 120);
    return () => clearTimeout(timer);
  }, [htmlPreview, previewMode, syncPreviewFrameHeight]);

  // const buildDocumentHtml = useCallback((doc) => {
  //   if (!doc?.documentElement) return null;
  //   const clone = doc.documentElement.cloneNode(true);
  //   const sourceInputs = doc.querySelectorAll("input");
  //   const clonedInputs = clone.querySelectorAll("input");
  //   sourceInputs.forEach((input, index) => {
  //     const clonedInput = clonedInputs[index];
  //     if (!clonedInput) return;
  //     if (input.type === "checkbox" || input.type === "radio") {
  //       if (input.checked) clonedInput.setAttribute("checked", "");
  //       else clonedInput.removeAttribute("checked");
  //     } else {
  //       clonedInput.setAttribute("value", input.value ?? "");
  //     }
  //   });
  //   return `<!DOCTYPE html>\n${clone.outerHTML}`;
  // }, []);
  const buildDocumentHtml = useCallback((doc) => {
    if (!doc?.documentElement) return null;
    const clone = doc.documentElement.cloneNode(true);

    // contenteditable text fields (char-box, line-field, etc.)
    const sourceEditable = doc.querySelectorAll('[contenteditable="true"]');
    const clonedEditable = clone.querySelectorAll('[contenteditable="true"]');
    sourceEditable.forEach((el, i) => {
      if (clonedEditable[i]) clonedEditable[i].innerHTML = el.innerHTML;
    });

    // checkbox-like boxes (square-box, gender-box, cb)
    const sourceChecks = doc.querySelectorAll(".square-box, .gender-box, .cb");
    const clonedChecks = clone.querySelectorAll(
      ".square-box, .gender-box, .cb",
    );
    sourceChecks.forEach((el, i) => {
      const target = clonedChecks[i];
      if (!target) return;
      target.setAttribute("data-checked", el.dataset.checked || "0");
      target.setAttribute("style", el.getAttribute("style") || "");
      target.textContent = el.textContent;
    });

    // signature canvases -> bake into <img> since canvas drawing doesn't serialize
    const sourceCanvases = doc.querySelectorAll("canvas");
    const clonedCanvases = clone.querySelectorAll("canvas");
    sourceCanvases.forEach((canvas, i) => {
      const target = clonedCanvases[i];
      if (!target) return;
      try {
        const dataUrl = canvas.toDataURL("image/png");
        const img = doc.createElement("img");
        img.src = dataUrl;
        img.style.cssText = "width:100%;height:100%;display:block;";
        target.replaceWith(img);
      } catch (_) {}
    });

    return `<!DOCTYPE html>\n${clone.outerHTML}`;
  }, []);

  const getHtmlOverride = useCallback(() => {
    if (Platform.OS === "web") {
      const iframeDoc = previewMode
        ? previewFrameRef.current?.contentDocument
        : editFrameRef.current?.contentDocument;
      return buildDocumentHtml(iframeDoc) || editedHtml;
    }
    return editedHtml;
  }, [buildDocumentHtml, editedHtml, previewMode]);

  const handleDownload = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    try {
      await downloadInsuranceClaim(form, signatureImage, getHtmlOverride());
    } catch (e) {
      Alert.alert(
        "Download Error",
        "Could not generate the PDF. Please try again.",
      );
    } finally {
      setIsDownloading(false);
    }
  };

  const fileName =
    analysisData?.structured_data?.source_filename || "CareHealth_PreAuth.pdf";

  // ── BUTTONS PANEL ─────────────────────────────────────────────────────────
  const ButtonsPanel = () => (
    <View style={styles.buttonsPanel}>
      {/* Open in editor */}
      <TouchableOpacity
        style={styles.outlineBtn}
        onPress={() => setPreviewMode(false)}
      >
        <Text style={styles.outlineText}>Open in editor</Text>
      </TouchableOpacity>

      {/* Download */}
      <TouchableOpacity
        style={[styles.primaryBtn, isDownloading && { opacity: 0.6 }]}
        onPress={handleDownload}
        disabled={isDownloading}
      >
        {isDownloading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.primaryText}>Download updated claim</Text>
        )}
      </TouchableOpacity>

      {/* Analyze another */}
      <TouchableOpacity style={styles.greenOutlineBtn}>
        <Text style={styles.greenOutlineText}>Analyze another claim</Text>
      </TouchableOpacity>

      {/* Set up integration */}
      <TouchableOpacity style={styles.greenBtn}>
        <Text style={styles.greenText}>Set up date Integration</Text>
      </TouchableOpacity>
    </View>
  );

  // ── MOBILE LAYOUT ─────────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <View style={styles.root}>
        <View style={styles.mobileInfoBox}>
          <Text style={styles.infoText}>
            Fill in the details below, then download.
          </Text>
        </View>

        <View style={{ alignItems: "flex-end", marginBottom: 8 }}>
          <TouchableOpacity
            style={styles.toggleBtn}
            onPress={() => setPreviewMode((p) => !p)}
          >
            <Text style={styles.toggleBtnText}>
              {previewMode ? "Edit Fields" : "Preview"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.mobileCard}>
          {Platform.OS === "web" ? (
            <iframe
              ref={previewMode ? previewFrameRef : editFrameRef}
              srcDoc={previewMode ? htmlPreview : editableHtml}
              onLoad={syncPreviewFrameHeight}
              style={{
                width: "100%",
                height: Math.max(500, previewFrameHeight),
                border: "none",
                display: "block",
                backgroundColor: "#fff",
              }}
              title="Care Health Pre-Auth Preview"
            />
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator>
              <View style={{ minWidth: 900, padding: 12 }}>
                <Text style={{ fontSize: 13, color: "#374151" }}>
                  {fileName}
                </Text>
                <Text style={{ fontSize: 11, color: "#6B7280", marginTop: 6 }}>
                  Download the form to view the full Care Health pre-auth PDF.
                </Text>
              </View>
            </ScrollView>
          )}
        </View>

        <View style={{ marginTop: 8 }}>
          <ButtonsPanel />
        </View>
      </View>
    );
  }

  // ── WEB / DESKTOP LAYOUT: form left | buttons right ───────────────────────
  return (
    <View style={styles.root}>
      {/* Info banner — full width above the two-column row */}
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            Care Health pre-auth form generated. Review below, make any final
            edits, then download.
          </Text>
        </View>

      {/* Two-column row */}
      <View style={styles.contentRow}>
        {/* LEFT — form card */}

        <View style={styles.formCol}>
          {/* Card header */}
          {/* <View style={styles.fileHeader}>
            <View style={styles.fileNameRow}>
              <Ionicons name="document-text" size={18} color="#1976D2" />
              <Text style={styles.fileName}>{fileName}</Text>
            </View>
            <TouchableOpacity
              onPress={() => setPreviewMode((p) => !p)}
              style={styles.toggleBtn}
            >
              <Text style={styles.toggleBtnText}>
                {previewMode ? "Edit Fields" : "Preview"}
              </Text>
            </TouchableOpacity>
          </View> */}
          <View style={styles.fileHeader}>
            <View style={styles.fileNameRow}>
              <Ionicons name="document-text" size={18} color="#1976D2" />
              <Text style={styles.fileName}>{fileName}</Text>
            </View>

            <TouchableOpacity
              onPress={() => setPreviewMode((p) => !p)}
              style={styles.toggleBtn}
            >
              <Text style={styles.toggleBtnText}>
                {previewMode ? "Edit Fields" : "Preview"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Preview iframe */}

          {previewMode ? (
            <View style={styles.iframeWrapper}>
              <iframe
                ref={previewFrameRef}
                srcDoc={htmlPreview}
                onLoad={() => {
                  syncPreviewFrameHeight();
                }}
                style={{
                  width: "100%",
                  height: previewFrameHeight,
                  border: "none",
                  display: "block",
                  backgroundColor: "#fff",
                }}
                title="Star Health Pre-Auth Edit"
              />
            </View>
          ) : (
            <View style={styles.iframeWrapper}>
              <iframe
                ref={editFrameRef}
                srcDoc={editableHtml}
                onLoad={syncPreviewFrameHeight}
                style={{
                  width: "100%",
                  height: previewFrameHeight,
                  border: "none",
                  display: "block",
                  backgroundColor: "#fff",
                }}
                title="Star Health Pre-Auth Edit"
              />
            </View>
          )}
        </View>

        {/* RIGHT — buttons panel */}
        <ButtonsPanel />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    padding: 16,
    paddingTop: 8,
  },

  // ── Info banner ────────────────────────────────────────────────────────────
  infoBox: {
    backgroundColor: "#E8F0FE",
    borderColor: "#90CAF9",
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 12,
    color: "#1E3A8A",
  },
  mobileInfoBox: {
    backgroundColor: "#E8F0FE",
    borderColor: "#90CAF9",
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },

  // ── Two-column row ─────────────────────────────────────────────────────────
  contentRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
  },

  // ── LEFT: form card ────────────────────────────────────────────────────────
  formCol: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    overflow: "hidden",
  },
  fileHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    backgroundColor: "#fff",
  },
  fileNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
  },
  fileName: {
    fontSize: 13,
    color: "#1976D2",
    fontWeight: "500",
    marginLeft: 6,
    flexShrink: 1,
  },
  toggleBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#1976D2",
    marginLeft: 10,
  },
  toggleBtnText: {
    fontSize: 11,
    color: "#1976D2",
    fontWeight: "600",
  },
  iframeWrapper: {
    width: "100%",
    overflow: "auto",
    backgroundColor: "#fff",
  },

  // ── RIGHT: buttons panel ───────────────────────────────────────────────────
  buttonsPanel: {
    width: 200,
    flexShrink: 0,
    gap: 12,
  },
  outlineBtn: {
    borderWidth: 1,
    borderColor: "#D0D5DD",
    borderRadius: 8,
    paddingVertical: 13,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  outlineText: {
    fontSize: 13,
    color: "#333",
    fontWeight: "500",
  },
  primaryBtn: {
    backgroundColor: "#1565C0",
    paddingVertical: 13,
    borderRadius: 8,
    alignItems: "center",
  },
  primaryText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  greenOutlineBtn: {
    borderWidth: 1,
    borderColor: "#2E7D32",
    paddingVertical: 13,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "#E8F5E9",
  },
  greenOutlineText: {
    color: "#2E7D32",
    fontSize: 13,
    fontWeight: "500",
  },
  greenBtn: {
    backgroundColor: "#2E7D32",
    paddingVertical: 13,
    borderRadius: 8,
    alignItems: "center",
  },
  greenText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  zoomRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginLeft: 10,
  },
  zoomBtn: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#1976D2",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  zoomBtnText: {
    fontSize: 14,
    color: "#1976D2",
    fontWeight: "700",
  },
  zoomLabel: {
    fontSize: 11,
    color: "#374151",
    minWidth: 36,
    textAlign: "center",
  },
});

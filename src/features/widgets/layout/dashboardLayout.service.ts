import {
  supabase,
} from "../../../services/supabase";

import type {
  DashboardLayoutIdentity,
  DashboardWidgetLayout,
  DashboardWidgetRow,
} from "./dashboardLayout.types";

const TABLE =
  "staff_dashboard_widgets";

function toLayout(
  row: DashboardWidgetRow
): DashboardWidgetLayout {
  return {
    id: row.id,

    widgetKey:
      row.widget_key,

    instanceKey:
      row.instance_key ||
      "default",

    x: row.x,
    y: row.y,

    w: row.w,
    h: row.h,

    visible:
      row.visible,

    stackId:
      row.stack_id ??
      null,

    stackOrder:
      row.stack_order ??
      0,  

    settings:
      row.settings ?? {},
  };
}

export async function getDashboardLayout({
  hotelId,
  userId,
  viewport,
}: DashboardLayoutIdentity) {
  const {
    data,
    error,
  } =
    await supabase
      .from(TABLE)
      .select("*")
      .eq(
        "hotel_id",
        hotelId
      )
      .eq(
        "user_id",
        userId
      )
      .eq(
        "viewport",
        viewport
      )
      .order(
        "y",
        {
          ascending:
            true,
        }
      )
      .order(
        "x",
        {
          ascending:
            true,
        }
      );

  if (error) {
    throw error;
  }

  return (
    (data ?? []) as DashboardWidgetRow[]
  ).map(
    toLayout
  );
}

export async function saveDashboardLayout(
  identity:
    DashboardLayoutIdentity,

  layout:
    DashboardWidgetLayout[]
) {
  if (
    layout.length === 0
  ) {
    return;
  }

  const now =
    new Date().toISOString();

  const rows =
    layout.map(
      (widget) => ({
        hotel_id:
          identity.hotelId,

        user_id:
          identity.userId,

        viewport:
          identity.viewport,

        widget_key:
          widget.widgetKey,

        instance_key:
          widget.instanceKey,

        x:
          widget.x,

        y:
          widget.y,

        w:
          widget.w,

        h:
          widget.h,

        visible:
          widget.visible,

        stack_id:
          widget.stackId,

        stack_order:
          widget.stackOrder,  

        settings:
          widget.settings,

        updated_at:
          now,
      })
    );

  const {
    error,
  } =
    await supabase
      .from(TABLE)
      .upsert(
        rows,
        {
          onConflict:
            "hotel_id,user_id,viewport,widget_key,instance_key",
        }
      );

  if (error) {
    throw error;
  }
}

export async function resetDashboardLayout({
  hotelId,
  userId,
  viewport,
}: DashboardLayoutIdentity) {
  const {
    error,
  } =
    await supabase
      .from(TABLE)
      .delete()
      .eq(
        "hotel_id",
        hotelId
      )
      .eq(
        "user_id",
        userId
      )
      .eq(
        "viewport",
        viewport
      );

  if (error) {
    throw error;
  }
}